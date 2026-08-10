import type { Launch, Launchpad, Rocket } from './types';

export class LaunchModel implements TLaunchModel {
  constructor(launch: Launch, rockets: Rocket[], launchpads: Launchpad[]) {
    this.id = launch.id;
    this.flightNumber = launch.flight_number;

    const launchpad = launchpads.find(
      (_launchpad) => _launchpad.id === launch.launchpad,
    );

    if (!launchpad) {
      throw new Error(`Launchpad for a ${launch.name} launch was not found!`);
    }

    this.site = launchpad.name;
    // patch images are frequently null in the SpaceX dataset; missionPatch is a
    // non-null field, so coalesce between sizes and fall back to an empty string
    const { patch } = launch.links;
    this.mission = {
      missionPatchLarge: patch?.large ?? patch?.small ?? '',
      missionPatchSmall: patch?.small ?? patch?.large ?? '',
      name: launch.name,
    };

    const rocket = rockets.find((_rocket) => _rocket.id === launch.rocket);

    if (!rocket) {
      throw new Error(`Rocket for ${launch.name} launch was not found!`);
    }

    this.rocket = {
      id: rocket.id,
      name: rocket.name,
      type: rocket.type,
    };
  }

  id: string;
  flightNumber: number;
  site: string;
  rocket: {
    id: string;
    name: string;
    type: string;
  };
  mission: {
    name: string;
    missionPatchSmall: string;
    missionPatchLarge: string;
  };
}

/* Types */
export interface TLaunchModel {
  flightNumber: number;
  id: string;

  mission: TMission;
  rocket: TRocket;
  site: string;
}

export interface TMission {
  missionPatchLarge: string;
  missionPatchSmall: string;
  name: string;
}

export interface TRocket {
  id: string;
  name: string;
  type: string;
}
