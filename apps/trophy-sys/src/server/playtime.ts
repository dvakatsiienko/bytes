import { getUserPlayedGames } from 'psn-api';

import { authGet } from './psn.ts';

export interface PlayRecord {
  playedAt: string;
  seconds: number;
}

/**
 * PSN reports playtime on a different endpoint, keyed by `titleId`
 * (PPSA16033_00), while trophies are keyed by `npCommunicationId`
 * (NPWR21904_00). Nothing in either response bridges the two, so the join is
 * on name and it is lossy — measured 94/108 on an exact normalised match.
 * Titles PSN has no playtime for at all (pre-dating its tracking) can never
 * match. A wrong playtime is worse than a blank one, so there is no fuzzy
 * scoring here: two cheap passes, then give up and report null.
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

export const playtimeFetch = async (): Promise<Map<string, PlayRecord>> => {
  const { titles } = await getUserPlayedGames(await authGet(), 'me', {
    limit: 200,
    offset: 0,
  });

  const byName = new Map<string, PlayRecord>();
  const byLooseName = new Map<string, PlayRecord>();

  for (const title of titles) {
    const record = {
      playedAt: title.lastPlayedDateTime,
      seconds: secondsParse(title.playDuration),
    };

    byName.set(nameKey(title.name), record);
    // First writer wins, so an exact-match name is never shadowed by a
    // loosened one from a different title.
    if (!byLooseName.has(nameKeyLoose(title.name)))
      byLooseName.set(nameKeyLoose(title.name), record);
  }

  return new Map([...byLooseName, ...byName]);
};

export const playtimeMatch = (
  played: Map<string, PlayRecord>,
  gameName: string,
): PlayRecord | null =>
  played.get(nameKey(gameName)) ?? played.get(nameKeyLoose(gameName)) ?? null;
