import { expect, test, vi } from 'vitest';

vi.mock('./psn.ts', () => ({ authGet: () => Promise.resolve({}) }));

vi.mock('psn-api', () => ({
  getUserPlayedGames: () =>
    Promise.resolve({
      titles: [
        {
          category: 'ps4_game',
          lastPlayedDateTime: '2019-01-01T00:00:00Z',
          name: 'METAL GEAR SOLID V: THE PHANTOM PAIN',
          playDuration: 'PT49M54S',
        },
        {
          category: 'ps4_game',
          lastPlayedDateTime: '2024-05-01T00:00:00Z',
          name: 'METAL GEAR SOLID V: THE DEFINITIVE EXPERIENCE',
          playDuration: 'PT714H3M3S',
        },
      ],
    }),
}));

const { playtimeFetch, playtimeMatch } = await import('./playtime.ts');

test('a bundle in the alias table adds its hours to the trophy row it contains', async () => {
  const played = await playtimeFetch();

  expect(
    playtimeMatch(played, 'METAL GEAR SOLID V: THE PHANTOM PAIN', 'PS4'),
  ).toStrictEqual({
    playedAt: '2024-05-01T00:00:00Z',
    seconds: 49 * 60 + 54 + 714 * 3600 + 3 * 60 + 3,
  });
});
