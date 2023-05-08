/* Core */
import { RESTDataSource } from '@apollo/datasource-rest';

/* Instruments */
import type { Launch, Rocket, Launchpad } from './types';
import { LaunchModel } from './LaunchModel';

export class SpaceXAPI extends RESTDataSource {
    public constructor () {
        super();

        this.baseURL = 'https://api.spacexdata.com';
    }

    public async getLaunches () {
        const launches = await this.get<Launch[]>('/v5/launches');

        const { rockets, launchpads } = await this.collectLaunchData(launches);

        const launchModels = launches.map((launch) => new LaunchModel(launch, rockets.flat(), launchpads.flat()));

        return launchModels;
    }

    public async getLaunch (id: string) {
        const launch = await this.get<Launch>(`/v5/launches/${ id }`);

        const { rockets, launchpads } = await this.collectLaunchData([ launch ]);

        const launchModel = new LaunchModel(launch, rockets, launchpads);

        return launchModel;
    }

    public async collectLaunchData (launches: Launch[]) {
        const [ rockets, launchpads ] = await Promise.all([
            Promise.all(launches.map((launch) => this.get<Rocket>(`/v4/rockets/${ launch.rocket }`))),
            Promise.all(launches.map((launch) => this.get<Launchpad>(`/v4/launchpads/${ launch.launchpad }`))),
        ]);

        return { rockets, launchpads };
    }

    public async getLaunchesByIds (ids: string[]) {
        const launches = await Promise.all(ids.map((id) => this.getLaunch(id)));

        return launches;
    }
}
