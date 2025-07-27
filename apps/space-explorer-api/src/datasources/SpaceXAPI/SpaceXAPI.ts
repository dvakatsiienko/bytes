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

    const launchModels = launches.map(
      (launch) => new LaunchModel(launch, rockets.flat(), launchpads.flat()),
    );

    return launchModels;
  }

  async getLaunch(id: string) {
    const launch = await this.get<Launch>(`/v5/launches/${id}`);

    const { rockets, launchpads } = await this.collectLaunchData([launch]);

    const launchModel = new LaunchModel(launch, rockets, launchpads);

    return launchModel;
  }

  async collectLaunchData(launches: Launch[]) {
    const [rockets, launchpads] = await Promise.all([
      Promise.all(
        launches.map((launch) =>
          this.get<Rocket>(`/v4/rockets/${launch.rocket}`),
        ),
      ),
      Promise.all(
        launches.map((launch) =>
          this.get<Launchpad>(`/v4/launchpads/${launch.launchpad}`),
        ),
      ),
    ]);

    return { launchpads, rockets };
  }

  async getLaunchesByIds(ids: string[]) {
    const launches = await Promise.all(ids.map((id) => this.getLaunch(id)));

    return launches;
  }
}
