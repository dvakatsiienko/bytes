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
