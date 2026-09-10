import type {
  AuthorizationPayload,
  TitleThinTrophy,
  UserThinTrophy,
} from 'psn-api';
import {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
  getTitleTrophies,
  getTitleTrophyGroups,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  getUserTrophyProfileSummary,
} from 'psn-api';

import type {
  Game,
  GameDetail,
  Profile,
  Trophy,
  TrophyCounts,
  TrophyGrade,
  TrophyGroup,
  TrophyProgress,
} from '../shared/types.ts';
import { NPSSO_INVALID } from '../shared/types.ts';
import { cached } from './cache.ts';
import {
  type PlayIndex,
  nameKey,
  nameKeyLoose,
  playtimeFetch,
  playtimeMatch,
} from './playtime.ts';
import { type PurchasedTitle, purchasedFetch } from './purchased.ts';

/**
 * PSN sends these for PS5 titles that count towards a target, but psn-api's
 * thin trophy types drop them — `trophyProgressTargetValue` is absent from
 * TitleThinTrophy, and the earned side declares no progress fields at all.
 * Verified live against NPWR23485_00 (Sifu).
 */
interface ProgressFields {
  progress?: string;
  progressRate?: number;
  trophyProgressTargetValue?: string;
}

interface Session {
  auth: AuthorizationPayload;
  expiresAt: number;
  refreshToken: string;
}

let session: Session | null = null;

const npssoRead = () => {
  const npsso = process.env.NPSSO;
  if (!npsso)
    throw new Error(
      'NPSSO missing — set it in .env locally, or as a Vercel env var in production',
    );
  return npsso;
};

const tokensMint = async () => {
  try {
    return await exchangeAccessCodeForAuthTokens(
      await exchangeNpssoForAccessCode(npssoRead()),
    );
  } catch (cause) {
    throw new Error(NPSSO_INVALID, { cause });
  }
};

export const authGet = async (): Promise<AuthorizationPayload> => {
  if (session && session.expiresAt > Date.now() + 60_000) return session.auth;

  const tokens = session
    ? await exchangeRefreshTokenForAuthTokens(session.refreshToken)
    : await tokensMint();

  session = {
    auth: { accessToken: tokens.accessToken },
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    refreshToken: tokens.refreshToken,
  };
  return session.auth;
};

/**
 * PSN hands these back as strings, and a malformed one turns into NaN that
 * survives every downstream check — a NaN rarity silently falls out of every
 * bucket in the rarity chart rather than showing up as wrong.
 */
const numberOr = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const profileFetch = async (): Promise<Profile> => {
  const summary = await getUserTrophyProfileSummary(await authGet(), 'me');
  const { bronze, silver, gold, platinum } = summary.earnedTrophies;

  return {
    accountId: summary.accountId,
    earned: { bronze, gold, platinum, silver },
    level: numberOr(summary.trophyLevel, 0),
    levelProgress: summary.progress,
    tier: summary.tier,
    total: bronze + silver + gold + platinum,
  };
};

const NO_TROPHIES: TrophyCounts = {
  bronze: 0,
  gold: 0,
  platinum: 0,
  silver: 0,
};

/**
 * The owned-but-never-launched titles, as `Game`s.
 *
 * Deduplicated against the trophy list by name, because nothing bridges the two
 * ids: the trophy list is keyed by `npCommunicationId` and the owned list by
 * `titleId`. That is the same lossy join `playtime.ts` documents, and it reuses
 * that file's two measured passes rather than growing a second matcher.
 *
 * 📌 The join is deliberately on the **bare** name here, not the
 * platform-qualified one playtime uses. The two failure modes are not
 * symmetric: a false match drops one row from a list that is already longer
 * than it was, while a missed match prints a title the user can plainly see
 * twice. A cross-gen title owned on PS5 and with trophies only on PS4 is one
 * game either way, so the bare name is also the more truthful key.
 */
const unplayedBuild = (
  purchased: PurchasedTitle[],
  withTrophies: Game[],
  played: PlayIndex,
): Game[] => {
  const seen = new Set(
    withTrophies.flatMap((game) => [
      nameKey(game.name),
      nameKeyLoose(game.name),
    ]),
  );

  const unplayed: Game[] = [];

  for (const title of purchased) {
    const keys = [nameKey(title.name), nameKeyLoose(title.name)];
    // Also guards the owned list against itself: one game is commonly two
    // entitlements (a base game and its upgrade).
    if (keys.some((key) => seen.has(key))) continue;
    for (const key of keys) seen.add(key);

    const play = playtimeMatch(played, title.name, title.platform);

    unplayed.push({
      defined: { ...NO_TROPHIES },
      earned: { ...NO_TROPHIES },
      iconUrl: title.iconUrl,
      id: title.titleId,
      // There is no such moment for a title with no trophy record. Empty rather
      // than a fake date: `dateFormat` prints it as the same `—` the playtime
      // column already uses, and `Date.parse('')` is NaN, so the stats archive's
      // freshness check reads it as "never newer" instead of "just changed".
      lastPlayedAt: '',
      name: title.name,
      platform: title.platform,
      playSeconds: play?.seconds ?? null,
      playedAt: play?.playedAt ?? null,
      progress: 0,
      source: 'psn-purchased',
    });
  }

  return unplayed;
};

/**
 * 800, not 100. The old default silently truncated: the library is 109 titles
 * and every caller taking the default saw the first 100, with nothing in the
 * response saying so.
 */
export const gamesFetch = async (limit = 800): Promise<Game[]> => {
  const [{ trophyTitles }, played, purchased] = await Promise.all([
    getUserTitles(await authGet(), 'me', { limit }),
    playtimeFetch(),
    // Degrades to the trophy library alone rather than taking down a route that
    // works today. Loud on the way down — a silent empty here would look exactly
    // like owning nothing extra, which is the bug this whole path exists to fix.
    purchasedFetch().catch((cause: unknown) => {
      console.error('purchased library unavailable', cause);
      return [];
    }),
  ]);

  const withTrophies = trophyTitles.map((title): Game => {
    const play = playtimeMatch(
      played,
      title.trophyTitleName,
      title.trophyTitlePlatform,
    );

    return {
      defined: { ...title.definedTrophies },
      earned: { ...title.earnedTrophies },
      iconUrl: title.trophyTitleIconUrl,
      id: title.npCommunicationId,
      lastPlayedAt: title.lastUpdatedDateTime,
      name: title.trophyTitleName,
      platform: title.trophyTitlePlatform,
      playSeconds: play?.seconds ?? null,
      playedAt: play?.playedAt ?? null,
      progress: title.progress,
      source: 'psn',
    };
  });

  // `limit` binds the whole answer, not just the trophy half. `newsFetch` asks
  // for 15 meaning "the 15 most recent titles to scan", and appending a few
  // hundred owned titles past that would have turned its budget into the whole
  // library.
  return [
    ...withTrophies,
    ...unplayedBuild(purchased, withTrophies, played),
  ].slice(0, limit);
};

export const gameDetailFetch = async (gameId: string): Promise<GameDetail> => {
  const games = await cached('games:800', () => gamesFetch(800));
  const game = games.find((candidate) => candidate.id === gameId);
  if (!game) throw new Error(`unknown game ${gameId}`);

  // Its id is a `titleId`, and every trophy endpoint below takes an
  // `npCommunicationId` — asking would answer 404 for a title that is fine.
  // There is genuinely nothing to show, so the empty set is the honest answer.
  if (game.source === 'psn-purchased')
    return { ...game, groups: [], trophies: [] };

  const [set, groups] = await Promise.all([
    trophiesFetch(game),
    groupsFetch(game),
  ]);

  return {
    ...game,
    groups: groupsBuild(groups, set.trophies),
    trophies: set.trophies,
  };
};

const serviceName = (game: Game) =>
  game.platform.includes('PS5') ? 'trophy2' : 'trophy';

const groupsFetch = async (game: Game) =>
  (
    await getTitleTrophyGroups(await authGet(), game.id, {
      npServiceName: serviceName(game),
    })
  ).trophyGroups;

const countsBuild = (trophies: Trophy[]): TrophyCounts => ({
  bronze: trophies.filter((trophy) => trophy.grade === 'bronze').length,
  gold: trophies.filter((trophy) => trophy.grade === 'gold').length,
  platinum: trophies.filter((trophy) => trophy.grade === 'platinum').length,
  silver: trophies.filter((trophy) => trophy.grade === 'silver').length,
});

/**
 * Earned counts are derived from the trophies already fetched rather than from
 * getUserTrophyGroupEarningsForTitle — same numbers, one fewer PSN round-trip.
 */
const groupsBuild = (
  groups: { trophyGroupId: string; trophyGroupName?: string }[],
  trophies: Trophy[],
): TrophyGroup[] =>
  groups.map((group) => {
    const mine = trophies.filter(
      (trophy) => trophy.group === group.trophyGroupId,
    );
    const earned = mine.filter((trophy) => trophy.earned);

    return {
      defined: countsBuild(mine),
      earned: countsBuild(earned),
      id: group.trophyGroupId,
      name: group.trophyGroupName ?? group.trophyGroupId,
      progress: mine.length
        ? Math.round((earned.length / mine.length) * 100)
        : 0,
    };
  });

const progressBuild = (
  definition: TitleThinTrophy & ProgressFields,
  earned: boolean,
  earning: (ProgressFields & UserThinTrophy) | undefined,
): TrophyProgress | null => {
  const total = Number(definition.trophyProgressTargetValue);
  if (!total) return null;

  // PSN stops reporting progress once the trophy pops.
  if (earned) return { current: total, rate: 100, target: total };

  return {
    current: numberOr(earning?.progress, 0),
    rate: earning?.progressRate ?? 0,
    target: total,
  };
};

export interface TrophySet {
  trophies: Trophy[];
  /** Bumped by the developer when a title gains or changes trophies. */
  version: string;
}

export const trophiesFetch = async (game: Game): Promise<TrophySet> => {
  // No trophy record exists, so both calls below would spend a PSN round-trip
  // to 404. The fan-outs in `news.ts` and `stats.ts` walk the whole library, so
  // this guard is what keeps the owned titles free rather than ~2 calls each.
  if (game.source === 'psn-purchased') return { trophies: [], version: '' };

  const auth = await authGet();
  const npServiceName = serviceName(game);

  const [definitions, earnings] = await Promise.all([
    getTitleTrophies(auth, game.id, 'all', { npServiceName }),
    getUserTrophiesEarnedForTitle(auth, 'me', game.id, 'all', {
      npServiceName,
    }),
  ]);

  const earnedById = new Map(
    earnings.trophies.map((trophy) => [trophy.trophyId, trophy]),
  );

  const trophies = definitions.trophies.map((definition) => {
    const earning = earnedById.get(definition.trophyId);
    const earned = earning?.earned ?? false;

    return {
      detail: definition.trophyDetail ?? '',
      earned,
      earnedAt: earning?.earnedDateTime ?? null,
      grade: definition.trophyType as TrophyGrade,
      group: definition.trophyGroupId ?? 'default',
      hidden: definition.trophyHidden,
      iconUrl: definition.trophyIconUrl ?? '',
      id: definition.trophyId,
      name: definition.trophyName ?? '(hidden)',
      progress: progressBuild(definition, earned, earning),
      rarity: numberOr(earning?.trophyEarnedRate, 0),
    };
  });

  return { trophies, version: definitions.trophySetVersion };
};
