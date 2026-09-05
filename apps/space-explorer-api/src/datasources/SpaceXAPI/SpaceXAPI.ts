import { RESTDataSource } from '@apollo/datasource-rest';

import { LaunchModel, rocketFamilies } from './LaunchModel';
import type { GatewayLaunch, GatewayRocket } from './types';

/**
 * Reads the Pipeworx gateway.
 *
 * ⚠️ `api.spacexdata.com` answers 525 and is not coming back — `r-spacex/SpaceX-API`
 * was archived in June 2026 and its origin TLS is dead. This gateway rebuilds
 * the same datasets from Launch Library 2 and space-track.org, synced four times
 * a day, so the data is current rather than frozen.
 *
 * 📌 Two calls serve the whole app, and that is the shape to keep. The gateway
 * offers no per-launch route and no launchpads route, so everything is derived
 * from one launch list joined to one rocket list. `RESTDataSource` memoizes GETs
 * per request, so a query touching a hundred launches still makes two.
 */
export class SpaceXAPI extends RESTDataSource {
  constructor() {
    super();

    this.baseURL = 'https://gateway.pipeworx.io/spacex/';
  }

  /**
   * Every launch the gateway holds — its rolling window of recent flights plus
   * the next scheduled one, about a hundred rows.
   *
   * Sorted ascending by date and numbered from there, because the gateway has
   * no flight number and `Query.launches` paginates on one: the cursor is the
   * last item's `flightNumber`, so it has to rise with time and stay stable
   * between requests.
   */
  async getLaunches() {
    const [launches, rockets] = await Promise.all([
      this.get<GatewayLaunch[]>('v4/launches'),
      this.get<GatewayRocket[]>('v4/rockets'),
    ]);

    const families = rocketFamilies(rockets);

    return [...launches]
      .sort((a, b) => Date.parse(a.date_utc) - Date.parse(b.date_utc))
      .map((launch, index) => new LaunchModel(launch, index + 1, families));
  }

  /**
   * One launch by its derived id.
   *
   * The gateway has no per-launch route, so this reads the list and finds the
   * row. It throws when the id resolves to nothing, which is load-bearing:
   * `bookTrips` relies on a bogus id rejecting to block the write.
   */
  async getLaunch(id: string) {
    const launches = await this.getLaunches();
    const launch = launches.find((candidate) => candidate.id === id);

    if (!launch) throw new Error(`Launch ${id} was not found!`);

    return launch;
  }

  /**
   * Strict by default so a bad id still blocks a booking; `allowMissing` drops
   * what it cannot resolve so trip history survives a launch ageing out of the
   * gateway's window.
   */
  async getLaunchesByIds(ids: string[], allowMissing = false) {
    const launches = await this.getLaunches();
    const byId = new Map(launches.map((launch) => [launch.id, launch]));

    return ids.flatMap((id) => {
      const launch = byId.get(id);

      if (launch) return [launch];
      if (allowMissing) return [];

      throw new Error(`Launch ${id} was not found!`);
    });
  }
}
