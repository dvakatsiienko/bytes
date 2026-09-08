export type TrophyGrade = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TrophyCounts {
  bronze: number;
  gold: number;
  platinum: number;
  silver: number;
}

export interface Profile {
  accountId: string;
  earned: TrophyCounts;
  level: number;
  levelProgress: number;
  tier: number;
  total: number;
}

/** Which service a title came from. */
export type GameSource = 'psn' | 'steam';

export interface Game {
  defined: TrophyCounts;
  earned: TrophyCounts;
  iconUrl: string;
  id: string;
  /** When trophy data last changed — not when the game was last played. */
  lastPlayedAt: string;
  name: string;
  platform: string;
  /** True last-played time, or null when the playtime join missed. */
  playedAt: string | null;
  /** Total seconds played, or null when the playtime join missed. */
  playSeconds: number | null;
  progress: number;
  source: GameSource;
}

export interface TrophyProgress {
  current: number;
  rate: number;
  target: number;
}

export interface Trophy {
  detail: string;
  earned: boolean;
  earnedAt: string | null;
  grade: TrophyGrade;
  group: string;
  hidden: boolean;
  iconUrl: string;
  id: number;
  name: string;
  /** PS5 only, and only for trophies that count towards a target. */
  progress: TrophyProgress | null;
  rarity: number;
}

/** One trophy set within a title — the base game, then each DLC. */
export interface TrophyGroup {
  defined: TrophyCounts;
  earned: TrophyCounts;
  id: string;
  name: string;
  progress: number;
}

export interface GameDetail extends Game {
  groups: TrophyGroup[];
  trophies: Trophy[];
}

/** A trophy lifted out of its title, for the cross-library feeds. */
export interface GameTrophy extends Trophy {
  gameIconUrl: string;
  gameId: string;
  gameName: string;
}

/** A title whose trophy set changed since the baseline — usually new DLC. */
export interface GameDrift {
  added: number;
  gameIconUrl: string;
  gameId: string;
  gameName: string;
}

export interface NewsFeed {
  drifted: GameDrift[];
  isBaseline: boolean;
  trophies: GameTrophy[];
}

/** One earned trophy, stripped to the fields the /stats charts read. */
export interface ArchivedTrophy {
  /** ISO instant the trophy popped. */
  at: string;
  /**
   * What the trophy asks for. Optional on purpose: an archive written before
   * the log route existed is still valid and still draws every chart, so this
   * arrives on the next scan rather than forcing one.
   */
  detail?: string;
  gameId: string;
  grade: TrophyGrade;
  /** Optional for the same reason as `detail`. */
  iconUrl?: string;
  name: string;
  /** Global PSN earn rate, as a percent. */
  rarity: number;
}

/** Where an incremental trophy's counter stands — "47 of 100 flags". */
export interface TrophyCounter {
  current: number;
  target: number;
}

/** A trophy still missing from a title that is under way. */
export interface RemainingTrophy {
  /**
   * The counter's standing, or null when the trophy has none — which is every
   * PS4 trophy and most PS5 ones.
   */
  counter: TrophyCounter | null;
  gameId: string;
  grade: TrophyGrade;
  name: string;
  /** Global PSN earn rate, as a percent. */
  rarity: number;
}

/**
 * Steam's types stay beside PSN's rather than folding into `Game`, and that is
 * a deliberate call rather than a shortcut.
 *
 * `Game` carries `defined`/`earned` as `TrophyCounts`, which is four named
 * grades. Steam achievements have no grades at all, and `GetOwnedGames` carries
 * no achievement counts either — those cost one call per title, 342 of them.
 * So every way of filling those fields for a Steam title either invents a grade
 * or reports a real number as zero. Making `Game` a discriminated union instead
 * would push narrowing onto 45 read sites across the web app, for data that no
 * UI consumes in this pass.
 *
 * `source` still lands on `Game` as the ticket asks, so the two are already
 * distinguishable when a later pass does merge them.
 */
export interface SteamProfile {
  avatarUrl: string;
  /** False when Steam answers 200 with an empty body — a private profile. */
  isPublic: boolean;
  name: string;
  profileUrl: string;
  steamId: string;
  /** Steam's own `communityvisibilitystate`; 3 is public. */
  visibility: number;
}

export interface SteamGame {
  iconUrl: string;
  /** The appid, as a string, to sit beside PSN's string ids. */
  id: string;
  name: string;
  /** ISO instant, or null when Steam reports no last-played time. */
  playedAt: string | null;
  /** Seconds, converted from the minutes Steam reports. */
  playSeconds: number;
  source: 'steam';
}

export interface SteamAchievement {
  description: string;
  earned: boolean;
  earnedAt: string | null;
  iconUrl: string;
  /** Steam's internal name, stable across locales. */
  id: string;
  name: string;
  /**
   * Percent of all owners holding it — Steam's analogue of PSN rarity. Null
   * when the global percentages call has nothing for this appid.
   */
  rarity: number | null;
}

export interface SteamGameDetail extends SteamGame {
  achievements: SteamAchievement[];
  earned: number;
  /**
   * False when Steam answers "Requested app has no stats" — the game is owned
   * and real, it simply ships no achievements. Distinct from an error.
   */
  hasAchievements: boolean;
  total: number;
}

export interface SteamWishlistItem {
  addedAt: string | null;
  id: string;
  /**
   * Resolved from the store api, one call per appid, and cached — the wishlist
   * endpoint itself carries only ids. Falls back to the appid when the store
   * has nothing, so an entry is never nameless.
   */
  name: string;
  /** Steam's own ordering; 0 means unprioritised. */
  priority: number;
}

/**
 * The trophy fan-out's output. Trophy-level data costs two PSN round-trips per
 * title, so the ~108-title scan runs on demand and everything downstream reads
 * this instead.
 */
export interface TrophyArchive {
  /** Titles the scan could not read. A partial archive still draws.  */
  failed: string[];
  /** Titles successfully read. */
  games: number;
  /** Unearned trophies, kept only for titles under way. */
  remaining: RemainingTrophy[];
  /** null until the first sync has run. */
  syncedAt: string | null;
  /** Sorted oldest first. */
  trophies: ArchivedTrophy[];
  /** Bumped when the stored shape changes; an older archive reads as empty. */
  version: number;
}
