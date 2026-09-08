import type {
  SteamAchievement,
  SteamGame,
  SteamGameDetail,
  SteamProfile,
  SteamWishlistItem,
} from '../shared/types.ts';
import { cached } from './cache.ts';

const API = 'https://api.steampowered.com';

/** Steam serves icons from its own host, keyed by the hash in the response. */
const ICON_BASE =
  'https://media.steampowered.com/steamcommunity/public/images/apps';

const credentialsRead = () => {
  const key = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID64;

  if (!(key && steamId))
    throw new Error(
      'STEAM_API_KEY and STEAM_ID64 missing — set both in apps/trophy-sys/.env locally, or as Vercel env vars in production',
    );

  return { key, steamId };
};

/**
 * Two things measured against the live API, both of which bite silently.
 *
 * The envelope key is not always `response`. `GetOwnedGames`,
 * `GetPlayerSummaries` and `GetWishlist` use it; `GetPlayerAchievements`
 * answers under `playerstats` and the global percentages under
 * `achievementpercentages`. Reading the wrong key yields `{}`, which looks
 * exactly like a private profile.
 *
 * And a private profile answers HTTP 200 with an empty envelope rather than a
 * 403, so emptiness is indistinguishable from an empty library unless the
 * caller checks. `isEmpty` is handed back explicitly so no caller can mistake
 * one for the other.
 *
 * A failing status is returned rather than thrown: some callers need to tell
 * 403 "Profile is not public" from 400 "Requested app has no stats", and those
 * mean opposite things.
 */
const steamGet = async <T>(
  path: string,
  params: Record<string, string>,
  envelope = 'response',
): Promise<{
  isEmpty: boolean;
  ok: boolean;
  payload: Partial<T>;
  status: number;
}> => {
  const url = new URL(`${API}/${path}`);
  for (const [name, value] of Object.entries(params))
    url.searchParams.set(name, value);

  const reply = await fetch(url);
  const body = (await reply.json().catch(() => ({}))) as Record<
    string,
    Partial<T>
  >;
  const payload = body[envelope] ?? {};

  return {
    isEmpty: Object.keys(payload).length === 0,
    ok: reply.ok,
    payload,
    status: reply.status,
  };
};

const privacyError = (what: string) =>
  new Error(
    `steam returned an empty body for ${what} — the profile or its game details are private. Both "My profile" and "Game details" must be Public. This is not an empty library.`,
  );

/* Profile */

interface RawPlayer {
  avatarfull?: string;
  communityvisibilitystate?: number;
  personaname?: string;
  profileurl?: string;
  steamid?: string;
}

export const profileFetch = async (): Promise<SteamProfile> => {
  const { key, steamId } = credentialsRead();
  const { ok, payload, status } = await steamGet<{ players: RawPlayer[] }>(
    'ISteamUser/GetPlayerSummaries/v2/',
    { key, steamids: steamId },
  );

  if (!ok) throw new Error(`steam profile summary answered ${status}`);

  const player = payload.players?.[0];
  if (!player) throw privacyError('the profile summary');

  const visibility = player.communityvisibilitystate ?? 0;

  return {
    avatarUrl: player.avatarfull ?? '',
    isPublic: visibility === 3,
    name: player.personaname ?? '',
    profileUrl: player.profileurl ?? '',
    steamId: player.steamid ?? steamId,
    visibility,
  };
};

/* Library */

interface RawOwnedGame {
  appid: number;
  img_icon_url?: string;
  name?: string;
  playtime_forever?: number;
  rtime_last_played?: number;
}

/**
 * Steam reports playtime in minutes and last-played as a unix second, and uses
 * 0 for "never" in both. Zero is a real value for playtime and a lie for a
 * date, so only the date collapses to null.
 */
export const playedAtBuild = (seconds: number | undefined) =>
  seconds ? new Date(seconds * 1000).toISOString() : null;

export const gameBuild = (raw: RawOwnedGame): SteamGame => ({
  iconUrl: raw.img_icon_url
    ? `${ICON_BASE}/${raw.appid}/${raw.img_icon_url}.jpg`
    : '',
  id: String(raw.appid),
  name: raw.name ?? String(raw.appid),
  playSeconds: (raw.playtime_forever ?? 0) * 60,
  playedAt: playedAtBuild(raw.rtime_last_played),
  source: 'steam',
});

export const gamesFetch = async (): Promise<SteamGame[]> => {
  const { key, steamId } = credentialsRead();
  const { isEmpty, ok, payload, status } = await steamGet<{
    game_count: number;
    games: RawOwnedGame[];
  }>('IPlayerService/GetOwnedGames/v1/', {
    include_appinfo: '1',
    include_played_free_games: '1',
    key,
    steamid: steamId,
  });

  if (!ok) throw new Error(`steam owned games answered ${status}`);
  if (isEmpty) throw privacyError('the owned games list');

  return (payload.games ?? [])
    .map(gameBuild)
    .sort((a, b) => b.playSeconds - a.playSeconds);
};

/* Achievements */

interface RawPlayerAchievement {
  achieved?: number;
  apiname?: string;
  description?: string;
  name?: string;
  unlocktime?: number;
}

interface RawPlayerStats {
  achievements?: RawPlayerAchievement[];
  error?: string;
  success?: boolean;
}

interface RawGlobalPercentage {
  name?: string;
  /** Measured: Steam sends this as a string, "62.7", not a number. */
  percent?: string;
}

/**
 * Global unlock percentages need no key and are the rarity analogue. A game
 * without achievements has none, and that is not a failure — it resolves to an
 * empty map so the caller carries on with `rarity: null`.
 */
const globalPercentagesFetch = async (
  appid: string,
): Promise<Map<string, number>> => {
  try {
    const { payload } = await steamGet<{ achievements: RawGlobalPercentage[] }>(
      'ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/',
      { gameid: appid },
      'achievementpercentages',
    );

    return new Map(
      (payload.achievements ?? []).map(
        (entry) => [entry.name ?? '', Number(entry.percent)] as const,
      ),
    );
  } catch {
    return new Map();
  }
};

export const achievementBuild = (
  raw: RawPlayerAchievement,
  percentages: Map<string, number>,
): SteamAchievement => {
  const id = raw.apiname ?? '';
  const earned = raw.achieved === 1;
  const percent = percentages.get(id);

  return {
    description: raw.description ?? '',
    earned,
    // Steam sends 0 rather than omitting the field for a locked achievement.
    earnedAt: earned && raw.unlocktime ? playedAtBuild(raw.unlocktime) : null,
    iconUrl: '',
    id,
    name: raw.name ?? id,
    rarity: percent ?? null,
  };
};

export const gameDetailFetch = async (
  appid: string,
): Promise<SteamGameDetail> => {
  const { key, steamId } = credentialsRead();

  const games = await cached('steam:games', gamesFetch);
  const game = games.find((candidate) => candidate.id === appid);
  if (!game)
    throw new Error(`unknown steam game ${appid} — not in the library`);

  const [stats, percentages] = await Promise.all([
    steamGet<RawPlayerStats>(
      'ISteamUserStats/GetPlayerAchievements/v1/',
      { appid, key, l: 'en', steamid: steamId },
      'playerstats',
    ),
    globalPercentagesFetch(appid),
  ]);

  // Two failures arrive here and they mean opposite things, so they are never
  // collapsed into one "no achievements" answer.
  //
  // 400 "Requested app has no stats" is ordinary: the game ships none. It
  // resolves to an empty set so a batch walking the library carries on.
  //
  // 403 "Profile is not public" is a permission problem, and reporting it as
  // "no achievements" would be the same lie as reporting a private profile as
  // an empty library. Measured 2026-09-08: this is the live answer for every
  // appid, because Steam's "Game details" privacy is a SEPARATE setting from
  // "My profile" — the summary reports visibility 3 while this stays closed.
  if (stats.payload.error === 'Profile is not public' || stats.status === 403)
    throw new Error(
      `steam will not show achievements for ${appid}: "Game details" privacy is not Public. It is a separate setting from "My profile", which is already public. Steam → Profile → Edit Profile → Privacy Settings → Game details.`,
    );

  const raw = stats.payload.achievements;
  if (!raw)
    return {
      ...game,
      achievements: [],
      earned: 0,
      hasAchievements: false,
      total: 0,
    };

  const achievements = raw.map((entry) => achievementBuild(entry, percentages));

  return {
    ...game,
    achievements,
    earned: achievements.filter((entry) => entry.earned).length,
    hasAchievements: true,
    total: achievements.length,
  };
};

/* Wishlist */

interface RawWishlistItem {
  appid?: number;
  date_added?: number;
  priority?: number;
}

/**
 * Measured 2026-09-08: this endpoint answers with an empty list unless `key` is
 * in the query, even though the docs imply the steamid alone is enough.
 */
export const wishlistFetch = async (): Promise<SteamWishlistItem[]> => {
  const { key, steamId } = credentialsRead();
  const { isEmpty, ok, payload, status } = await steamGet<{
    items: RawWishlistItem[];
  }>('IWishlistService/GetWishlist/v1/', { key, steamid: steamId });

  if (!ok) throw new Error(`steam wishlist answered ${status}`);
  if (isEmpty) throw privacyError('the wishlist');

  return (payload.items ?? [])
    .map((item) => ({
      addedAt: playedAtBuild(item.date_added),
      id: String(item.appid ?? ''),
      priority: item.priority ?? 0,
    }))
    .sort((a, b) => a.priority - b.priority);
};
