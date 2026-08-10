import { RESTDataSource } from '@apollo/datasource-rest';

import { LaunchModel } from './LaunchModel';
import type { Launch, Launchpad, Rocket } from './types';

export class SpaceXAPI extends RESTDataSource {
  constructor() {
    super();

    this.baseURL = 'https://api.spacexdata.com';
  }

  async getLaunches() {
    const launches = await this.get<Launch[]>('/v5/launches');

    const { rockets, launchpads } = await this.collectLaunchData(launches);

    // skip any launch that can't be fully resolved rather than throwing the
    // whole page — one launch with a missing rocket/launchpad must not null the
    // entire non-null `LaunchesPayload!` for every client
    const models = launches.flatMap((launch) => {
      try {
        return [new LaunchModel(launch, rockets, launchpads)];
      } catch {
        return [];
      }
    });

    // sort ascending by flightNumber so value-based cursor pagination is exact
    // and hasMore's "last element" is genuinely the highest flight number
    return models.sort((a, b) => a.flightNumber - b.flightNumber);
  }

  async getLaunch(id: string) {
    const launch = await this.get<Launch>(`/v5/launches/${id}`);

    const { rockets, launchpads } = await this.collectLaunchData([launch]);

    const launchModel = new LaunchModel(launch, rockets, launchpads);

    return launchModel;
  }

  async collectLaunchData(launches: Launch[]) {
    // fetch resiliently: a single failed rocket/launchpad lookup must not reject
    // the whole batch. A launch whose data is missing here simply won't match in
    // LaunchModel — getLaunches skips it, getLaunch (single) still throws.
    const [rockets, launchpads] = await Promise.all([
      settled(
        launches.map((launch) =>
          this.get<Rocket>(`/v4/rockets/${launch.rocket}`),
        ),
      ),
      settled(
        launches.map((launch) =>
          this.get<Launchpad>(`/v4/launchpads/${launch.launchpad}`),
        ),
      ),
    ]);

    return { launchpads, rockets };
  }

  // strict by default (bookTrips relies on a bogus id throwing to block the write);
  // allowMissing drops unresolvable ids so trip history survives one dead launch
  getLaunchesByIds(ids: string[], allowMissing = false) {
    if (!allowMissing) {
      return Promise.all(ids.map((id) => this.getLaunch(id)));
    }

    return settled(ids.map((id) => this.getLaunch(id)));
  }
}

async function settled<T>(promises: Promise<T>[]) {
  const results = await Promise.allSettled(promises);

  return results
    .filter((result): result is PromiseFulfilledResult<Awaited<T>> => {
      return result.status === 'fulfilled';
    })
    .map((result) => result.value);
}
