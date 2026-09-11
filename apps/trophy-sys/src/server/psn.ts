import type {
  AuthTokensResponse,
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
import type { RefreshGrant } from './state.ts';
import {
  isStateWritable,
  npssoDeathRecord,
  npssoLoad,
  refreshGrantDeathRecord,
  refreshGrantLoad,
  refreshGrantSave,
} from './state.ts';

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
  /** The grant this session came from, carried so a refresh keeps its mint date. */
  grant: RefreshGrant;
}

let session: Session | null = null;

/**
 * KV is the source of the NPSSO. `process.env.NPSSO` is a bootstrap seed and
 * nothing more: it carries a deploy that has never been pasted into, and the
 * first paste retires it for good. Renewing an expired token must not need a
 * redeploy, which is the whole reason the store outranks it.
 */
const npssoRead = async () => {
  const npsso = (await npssoLoad()) ?? process.env.NPSSO;
  if (!npsso)
    throw new Error(
      'NPSSO missing — paste one on the admin page, or seed it in .env locally and as a Vercel env var for a first deploy',
    );

  return npsso;
};

/**
 * psn-api answers a refused NPSSO with prose naming the access code, and the
 * only other thing it could plausibly be is a transport failure — which carries
 * a node error code instead. Matching the prose is fragile, so the fallback is
 * the safe direction: an unrecognised error is NOT recorded as a death.
 */
const rejection = (cause: unknown) => {
  if (typeof cause === 'object' && cause !== null && 'code' in cause)
    return false;

  return REFUSAL.test(cause instanceof Error ? cause.message : String(cause));
};

const REFUSAL = /access code|npsso/i;

/**
 * A session from PSN's token response, or null when the response is not one.
 *
 * ⚠️ The shape IS the error check. psn-api never looks at the response status
 * on either token call: a refused refresh grant comes back as `{}` rather than
 * a thrown error (measured 2026-09-11), and a session built from that carries
 * `expiresAt: NaN`, which compares false against every clock — so every later
 * call re-mints, against a rate-limited api, forever.
 */
const sessionBuild = (
  tokens: AuthTokensResponse,
  mintedAt: number,
): Session | null => {
  if (!(tokens.accessToken && tokens.refreshToken && tokens.expiresIn))
    return null;

  return {
    auth: { accessToken: tokens.accessToken },
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    grant: {
      expiresIn: numberOr(tokens.refreshTokenExpiresIn, 0),
      mintedAt,
      refreshedAt: Date.now(),
      token: tokens.refreshToken,
    },
  };
};

const grantMint = async (): Promise<Session> => {
  const npsso = await npssoRead();

  let tokens: AuthTokensResponse;
  try {
    tokens = await exchangeAccessCodeForAuthTokens(
      await exchangeNpssoForAccessCode(npsso),
    );
  } catch (cause) {
    // ⚠️ Only a refusal counts as a death. A timeout, a DNS failure or a PSN
    // outage reaches this same catch, and treating one as an expired token both
    // poisons the lifetime measurement with a false sample and tells the owner
    // to go fetch a code that is perfectly fine.
    if (!rejection(cause)) throw cause;

    // Names the token that failed, so a rejection racing a fresh paste cannot
    // write the dead one back. Stamps the death once, so the next token's age
    // can be compared against a measured lifetime rather than folklore.
    await npssoDeathRecord(npsso);
    throw new Error(NPSSO_INVALID, { cause });
  }

  const minted = sessionBuild(tokens, Date.now());
  // Not an NPSSO death: the access code was issued, so the token PSN refused to
  // honour is not the one the owner would be sent to replace.
  if (!minted)
    throw new Error('PSN returned no tokens for an accepted access code');

  return minted;
};

/**
 * One access token, however it can be had: the grant this process already
 * holds, the one in the store, and only then a fresh NPSSO exchange.
 *
 * The order is the whole feature. The NPSSO is the scarce half — it expires in
 * weeks, no code can renew it, and every cold serverless start used to spend one
 * on the access-code exchange. A stored grant costs one PSN call and no NPSSO.
 */
const sessionAcquire = async (): Promise<Session> => {
  const held = session?.grant ?? (await refreshGrantLoad());
  if (!held) return await grantMint();

  const refreshed = sessionBuild(
    await exchangeRefreshTokenForAuthTokens(held.token),
    held.mintedAt,
  );
  if (refreshed) return refreshed;

  // ⚠️ A weaker sample than the NPSSO's. psn-api maps seven token fields and
  // drops the error body, so a genuine `invalid_grant` and a PSN `server_error`
  // both arrive as `{}` — a bad hour at Sony can therefore log a grant as dead
  // early. A transport failure is still safe (it throws, and never reaches
  // here), and the fallback below is correct either way; only the measurement
  // can be poisoned. The readout under-claims accordingly.
  await refreshGrantDeathRecord(held);
  return await grantMint();
};

/**
 * The memoised half of `authGet`: one session, and one write of the grant it
 * carries. The write lives here rather than in `authGet` because every caller
 * arriving during a mint awaits this same promise — persisting there stored the
 * identical record once per concurrent caller.
 */
const sessionGet = async (): Promise<Session> => {
  const fresh = await sessionAcquire();
  await grantPersist(fresh.grant);
  return fresh;
};

/**
 * The store is the point: a grant held only in memory dies with the process,
 * which is the state this whole path exists to end. Failing to write it must not
 * fail the call that was actually asked for, so it is logged and swallowed.
 *
 * 📌 Guarded by `isStateWritable`, not `isAutoWriteSafe`. What `isAutoWriteSafe`
 * exists to stop is a local run rewriting shared *data*; a grant is not data, it
 * is the session. PSN hands back the same token on every refresh, so two writers
 * cannot disagree about what to store, and `.env.dev.local` already keeps the
 * ordinary local run off the production store.
 */
const grantPersist = async (grant: RefreshGrant) => {
  if (!isStateWritable) return;

  try {
    await refreshGrantSave(grant);
  } catch (cause) {
    console.error('psn refresh grant not persisted', cause);
  }
};

/**
 * Drops the cached session so the next call rebuilds one from the store.
 *
 * 📌 It does **not** force an NPSSO exchange any more — the next call finds the
 * stored refresh grant and uses that. A caller who needs the NPSSO itself
 * retried clears the grant too; `npssoSet` in `admin.ts` is the one that does.
 */
export const sessionReset = () => {
  session = null;
  minting = null;
};

/**
 * Shared by every caller that arrives while a mint is in flight. Without it a
 * cold process answering several routes at once ran one NPSSO exchange each —
 * against a rate-limited api, and each failure recording the same death again.
 */
let minting: Promise<Session> | null = null;

export const authGet = async (): Promise<AuthorizationPayload> => {
  if (session && session.expiresAt > Date.now() + 60_000) return session.auth;

  minting ??= sessionGet();

  let fresh: Session;
  try {
    fresh = await minting;
  } finally {
    // Cleared either way: a memoised rejection would make one expired token
    // permanent for the life of the process.
    minting = null;
  }

  session = fresh;
  return fresh.auth;
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
export const unplayedBuild = (
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
  const games = await cached('games:raw:800', () => gamesFetch(800));
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
