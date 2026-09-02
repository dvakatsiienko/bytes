import { newsFetch } from './news.ts';
import { gameDetailFetch, gamesFetch, profileFetch } from './psn.ts';
import { statsFetch, statsSync } from './stats.ts';

const [command = 'games', arg] = process.argv.slice(2);

const commands: Record<string, () => Promise<unknown>> = {
  game: () => gameDetailFetch(String(arg)),
  games: () => gamesFetch(Number(arg ?? 100)),
  news: () => newsFetch({ commit: false }),
  profile: profileFetch,
  snapshot: () => newsFetch({ commit: true }),
  stats: statsFetch,
  // The scan's result is the operation, not the payload — `stats` prints rows.
  'stats-sync': async () => {
    const archive = await statsSync();
    return { ...archive, trophies: archive.trophies.length };
  },
};

const run = commands[command];
if (!run) {
  console.error(
    `unknown command "${command}" — one of: ${Object.keys(commands).join(', ')}`,
  );
  process.exit(1);
}

console.log(JSON.stringify(await run(), null, 2));
