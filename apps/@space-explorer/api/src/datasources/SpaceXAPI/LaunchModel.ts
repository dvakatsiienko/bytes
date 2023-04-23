/* Instruments */
import { Launch, Rocket, Launchpad } from './types';

export class LaunchModel implements TLaunchModel {
    id: string;

    flightNumber: number;

    site: string;

    mission: {
        name: string;
        missionPatchSmall: string;
        missionPatchLarge: string;
    };

    rocket: {
        id: string;
        name: string;
        type: string;
    };

    constructor(launch: Launch, rockets: Rocket[], launchpads: Launchpad[]) {
        this.id = launch.id;
        this.flightNumber = launch.flight_number;

        const launchpad = launchpads.find(
            _launchpad => _launchpad.id === launch.launchpad,
        );

        if (!launchpad) {
            throw new Error(
                `Launchpad for a ${launch.name} launch was not found!`,
            );
        }

        this.site = launchpad.name;
        this.mission = {
            name:              launch.name,
            missionPatchSmall: launch.links.patch.small,
            missionPatchLarge: launch.links.patch.large,
        };

        const rocket = rockets.find(_rocket => _rocket.id === launch.rocket);

        if (!rocket) {
            throw new Error(`Rocket for ${launch.name} launch was not found!`);
        }

        this.rocket = {
            id:   rocket.id,
            name: rocket.name,
            type: rocket.type,
        };
    }
}

/* Types */
export interface TLaunchModel {
    id: string;
    flightNumber: number;
    site: string;

    mission: TMission;
    rocket: TRocket;
}

export interface TMission {
    name: string;
    missionPatchSmall: string;
    missionPatchLarge: string;
}

export interface TRocket {
    id: string;
    name: string;
    type: string;
}
