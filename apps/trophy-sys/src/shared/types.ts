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
  lastPlayedAt: string;
  name: string;
  platform: string;
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

export interface GameDetail extends Game {
  trophies: Trophy[];
}

export interface NewTrophy extends Trophy {
  gameIconUrl: string;
  gameId: string;
  gameName: string;
}

export interface NewsFeed {
  isBaseline: boolean;
  trophies: NewTrophy[];
}
