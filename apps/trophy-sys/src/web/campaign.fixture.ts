import type {
  ArchivedTrophy,
  Game,
  RemainingTrophy,
  TrophyArchive,
  TrophyGrade,
} from '../shared/types.ts';

/**
 * A made-up library and archive, the same on every run, so a layout test never
 * reads the owner's real data and never changes when he earns a trophy.
 * Sized like a real account — two years of trophies over two dozen titles — so
 * every chart has enough to draw its widest axis.
 */

/** A seeded generator: the same numbers every run, no Math.random. */
const seeded = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;
    return state / 2_147_483_648;
  };
};

const random = seeded(88);
const DAY_MS = 86_400_000;
const START = Date.UTC(2024, 8, 1);
const SPAN_DAYS = 730;
const GRADES: TrophyGrade[] = ['bronze', 'bronze', 'bronze', 'silver', 'gold'];

const idOf = (index: number) => `NPWR${String(index).padStart(5, '0')}_00`;

const gameCount = 24;

const trophies: ArchivedTrophy[] = [];
const remaining: RemainingTrophy[] = [];

const games: Game[] = Array.from({ length: gameCount }, (_, index) => {
  const defined = 20 + Math.floor(random() * 40);
  const earned = index % 5 === 0 ? defined : Math.floor(random() * defined);
  const first = Math.floor(random() * (SPAN_DAYS - 60));

  for (let trophy = 0; trophy < earned; trophy += 1) {
    const day = first + Math.floor(random() * 60);
    trophies.push({
      at: new Date(START + day * DAY_MS + random() * DAY_MS).toISOString(),
      gameId: idOf(index),
      grade:
        index % 5 === 0 && trophy === earned - 1
          ? 'platinum'
          : (GRADES[trophy % GRADES.length] ?? 'bronze'),
      name: `trophy ${trophy}`,
      rarity: Math.round(random() * 900) / 10,
    });
  }

  for (
    let trophy = earned;
    trophy < defined && trophy < earned + 6;
    trophy += 1
  )
    remaining.push({
      counter: null,
      gameId: idOf(index),
      grade: 'bronze',
      name: `trophy ${trophy}`,
      rarity: Math.round(random() * 900) / 10,
    });

  const seconds = Math.floor(3600 * (1 + random() * 120));

  return {
    defined: { bronze: defined - 4, gold: 1, platinum: 1, silver: 2 },
    earned: {
      bronze: earned,
      gold: 0,
      platinum: index % 5 === 0 ? 1 : 0,
      silver: 0,
    },
    iconUrl: '',
    id: idOf(index),
    lastPlayedAt: new Date(START + (first + 60) * DAY_MS).toISOString(),
    name: `Fixture Title Number ${index}`,
    platform: index % 3 === 0 ? 'PS4' : 'PS5',
    playSeconds: seconds,
    playedAt: new Date(START + (first + 60) * DAY_MS).toISOString(),
    progress: Math.round((earned / defined) * 100),
    source: 'psn',
  };
});

trophies.sort((a, b) => a.at.localeCompare(b.at));

export const gamesFixture = games;

export const archiveFixture: TrophyArchive = {
  failed: [],
  games: gameCount,
  remaining,
  syncedAt: new Date(START + SPAN_DAYS * DAY_MS).toISOString(),
  trophies,
  version: 2,
};
