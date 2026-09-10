import type { AuthorizationPayload, PurchasedGame } from 'psn-api';
import { getPurchasedGames } from 'psn-api';

import { authGet } from './psn.ts';

/**
 * The owned library, which is a different thing from the trophy library.
 *
 * `getUserTitles` — the endpoint every other part of this app reads — is the
 * _trophy_ endpoint: a title appears there only once it has a trophy record,
 * which means it was launched at least once. A game bought and never opened is
 * invisible to it. Rogue Legacy 2 sat in the library for months and only
 * surfaced as title #110 after a single launch.
 *
 * `getPurchasedGames` is PSN's entitlement list, served from the graphql host
 * (`web.np.playstation.com/api/graphql/v1/op`, persisted query
 * `getPurchasedGameList`). It takes the same access token as the trophy calls,
 * so no extra scope or second login is involved.
 *
 * 📌 Two limits worth knowing, both PSN's rather than ours: the endpoint
 * returns PS4 and PS5 titles only (nothing from PS3 or Vita), and it lists
 * entitlements — so a PS Plus catalogue title counts as owned for as long as
 * the membership holds it.
 */
export interface PurchasedTitle {
  iconUrl: string;
  name: string;
  /** `PS4` / `PS5`, the same vocabulary as `trophyTitlePlatform`. */
  platform: string;
  /** PSN's title id (`PPSA16033_00`) — never an `npCommunicationId`. */
  titleId: string;
}

/**
 * PSN's own default is 24. A larger page is the whole point here — the library
 * is fetched in full, not browsed — and the loop stops on the first short page
 * rather than trusting a count the response does not carry.
 */
const PAGE_SIZE = 100;

/**
 * A stop that cannot be reached by a healthy account. It exists because the
 * termination condition is a short page: if PSN ever answered a full page
 * forever, the loop would page until the process died.
 */
const PAGE_MAX = 20;

/**
 * Throws only on the first page. A later page failing yields the titles
 * already read rather than nothing — a partial owned library is still more
 * library than the trophy list alone, and the caller degrades on an empty
 * result anyway.
 */
const pageFetch = async (auth: AuthorizationPayload, start: number) => {
  const { data } = await getPurchasedGames(auth, { size: PAGE_SIZE, start });
  const { games } = data.purchasedTitlesRetrieve;
  return games;
};

export const purchasedFetch = async (): Promise<PurchasedTitle[]> => {
  const auth = await authGet();
  const titles: PurchasedTitle[] = [];

  for (let page = 0; page < PAGE_MAX; page += 1) {
    const start = page * PAGE_SIZE;

    let games: PurchasedGame[];

    try {
      // The response carries no total, so whether another page exists is only
      // knowable by asking for this one — the pages cannot be requested together.
      // biome-ignore lint/performance/noAwaitInLoops: paging is sequential
      games = await pageFetch(auth, start);
    } catch (cause) {
      if (page === 0) throw cause;
      console.error(`purchased library: page at ${start} failed`, cause);
      break;
    }

    for (const game of games)
      titles.push({
        iconUrl: game.image.url,
        name: game.name,
        platform: game.platform,
        titleId: game.titleId,
      });

    if (games.length < PAGE_SIZE) break;
  }

  return titles;
};
