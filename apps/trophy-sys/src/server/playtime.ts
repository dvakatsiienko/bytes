import { getUserPlayedGames } from 'psn-api';

import { authGet } from './psn.ts';

export interface PlayRecord {
  playedAt: string;
  seconds: number;
}

/** `ps5_native_game` → `PS5`, matching `trophyTitlePlatform`'s vocabulary. */
const platformKey = (category: string) =>
  category.split('_')[0]?.toUpperCase() ?? '';

/**
 * PSN reports playtime on a different endpoint, keyed by `titleId`
 * (PPSA16033_00), while trophies are keyed by `npCommunicationId`
 * (NPWR21904_00). Nothing in either response bridges the two, so the join is
 * on name and it is lossy — measured 94/108 on an exact normalised match.
 * Titles PSN has no playtime for at all (pre-dating its tracking) can never
 * match. A wrong playtime is worse than a blank one, so there is no fuzzy
 * scoring here — two cheap name passes, qualified by platform because a
 * cross-gen release ships the same name twice, then give up and report null.
 */
// Deliberately no NFKD: it decomposes ™ into the letters "TM", which adds
// characters to one side of the join and cost 8 matches when measured.
const nameKey = (name: string) => name.toLowerCase().replace(NON_ALNUM, '');

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
const NON_ALNUM = /[^a-z0-9]/g;
const ARABIC = /\b(10|[1-9])\b/g;
const TRAILING_TROPHIES = /trophies$/;
const TRAILING_REMASTERED = /remastered$/;
const DURATION = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;

/** Second pass, applied only to names the exact match missed. */
const nameKeyLoose = (name: string) => {
  const arabic = name.replace(
    ARABIC,
    (digits) => ROMAN[Number(digits) - 1] ?? digits,
  );

  return nameKey(arabic)
    .replace(TRAILING_TROPHIES, '')
    .replace(TRAILING_REMASTERED, '');
};

const secondsParse = (duration: string) => {
  const parts = duration.match(DURATION);
  if (!parts) return 0;
  const [, hours, minutes, seconds] = parts;
  return (
    Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0)
  );
};

export interface PlayIndex {
  /** Keyed by name alone. Ambiguous names are evicted rather than guessed. */
  byName: Map<string, PlayRecord>;
  /** Keyed `name|PLATFORM`, so a PS4 and PS5 release never collide. */
  byNamePlatform: Map<string, PlayRecord>;
}

interface Entry {
  exact: string;
  loose: string;
  record: PlayRecord;
}

const recordsMerge = (a: PlayRecord, b: PlayRecord): PlayRecord => ({
  playedAt: a.playedAt > b.playedAt ? a.playedAt : b.playedAt,
  seconds: a.seconds + b.seconds,
});

/**
 * Exact names win outright, loosened ones only fill gaps, and any key two
 * titles could claim is dropped rather than guessed — a wrong playtime is
 * worse than a blank one.
 *
 * `collide` is `merge` only for the platform-qualified index: one name on one
 * platform twice is the same game under two title ids (regional SKUs), so the
 * honest answer is the sum. On a bare name it would silently add a PS4 and a
 * PS5 playthrough together, which is why that index evicts instead.
 */
const indexBuild = (entries: Entry[], collide: 'merge' | 'evict') => {
  const index = new Map<string, PlayRecord>();
  const collided = new Set<string>();

  for (const { exact, record } of entries) {
    const seen = index.get(exact);
    if (!seen) {
      index.set(exact, record);
      continue;
    }

    if (collide === 'merge') index.set(exact, recordsMerge(seen, record));
    else collided.add(exact);
  }
  for (const key of collided) index.delete(key);

  const fromLoose = new Map<string, PlayRecord>();
  const looseCollided = new Set<string>();

  for (const { exact, loose, record } of entries) {
    // Never shadow a real name, and never resurrect one already ruled out.
    if (loose === exact || index.has(loose) || collided.has(loose)) continue;

    const seen = fromLoose.get(loose);
    if (!seen) fromLoose.set(loose, record);
    else if (collide === 'merge')
      fromLoose.set(loose, recordsMerge(seen, record));
    else looseCollided.add(loose);
  }

  for (const key of looseCollided) fromLoose.delete(key);
  for (const [key, record] of fromLoose) index.set(key, record);

  return index;
};

export const playtimeFetch = async (): Promise<PlayIndex> => {
  const { titles } = await getUserPlayedGames(await authGet(), 'me', {
    limit: 200,
    offset: 0,
  });

  const entries = titles.map((title) => ({
    exact: nameKey(title.name),
    loose: nameKeyLoose(title.name),
    platform: platformKey(title.category),
    record: {
      playedAt: title.lastPlayedDateTime,
      seconds: secondsParse(title.playDuration),
    },
  }));

  return {
    byName: indexBuild(entries, 'evict'),
    byNamePlatform: indexBuild(
      entries.map((entry) => ({
        exact: `${entry.exact}|${entry.platform}`,
        loose: `${entry.loose}|${entry.platform}`,
        record: entry.record,
      })),
      'merge',
    ),
  };
};

export const playtimeMatch = (
  played: PlayIndex,
  gameName: string,
  platform: string,
): PlayRecord | null => {
  const keys = [nameKey(gameName), nameKeyLoose(gameName)];
  const hits: PlayRecord[] = [];

  for (const plat of platform.split(','))
    for (const key of keys) {
      const hit = played.byNamePlatform.get(`${key}|${plat.trim()}`);
      if (hit && !hits.includes(hit)) {
        hits.push(hit);
        break;
      }
    }

  // A cross-gen title is one game on two platforms and PSN counts each
  // separately, so the honest total is their sum.
  if (hits.length) return hits.reduce(recordsMerge);

  for (const key of keys) {
    const hit = played.byName.get(key);
    if (hit) return hit;
  }

  return null;
};
