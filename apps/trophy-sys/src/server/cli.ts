import { newsFetch } from './news.ts';
import { gameDetailFetch, gamesFetch, profileFetch } from './psn.ts';
import { statsFetch, statsSync } from './stats.ts';
import {
  gameDetailFetch as steamGameDetailFetch,
  gamesFetch as steamGamesFetch,
  profileFetch as steamProfileFetch,
  wishlistFetch as steamWishlistFetch,
} from './steam.ts';

const [command = 'games', arg] = process.argv.slice(2);

const commands: Record<string, () => Promise<unknown>> = {
  game: () => gameDetailFetch(String(arg)),
  // No numeric default here on purpose: gamesFetch's own 800 is the one place
  // that number lives. Passing 100 from here is what kept truncating the list
  // even after the library outgrew it.
  games: () => (arg ? gamesFetch(Number(arg)) : gamesFetch()),
  news: () => newsFetch({ commit: false }),
  profile: profileFetch,
  snapshot: () => newsFetch({ commit: true }),
  stats: async () => (await statsFetch()).archive,
  // The scan's result is the operation, not the payload — `stats` prints rows.
  'stats-sync': async () => {
    const archive = await statsSync();
    return { ...archive, trophies: archive.trophies.length };
  },
  'steam-game': () => steamGameDetailFetch(String(arg)),
  'steam-games': steamGamesFetch,
  'steam-profile': steamProfileFetch,
  'steam-wishlist': steamWishlistFetch,
};

const run = commands[command];
if (!run) {
  console.error(
    `unknown command "${command}" — one of: ${Object.keys(commands).join(', ')}`,
  );
  process.exit(1);
}

console.log(JSON.stringify(await run(), null, 2));
