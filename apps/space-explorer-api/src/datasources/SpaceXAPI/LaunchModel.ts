import type { GatewayLaunch, GatewayRocket } from './types';

/**
 * One launch in the shape the GraphQL schema promises.
 *
 * 📌 The schema is unchanged and every field it declares is still served — but
 * the gateway supplies only four of them, so the rest are derived here. Keeping
 * the schema still is the point: the UI's `LaunchFragment`, its generated types
 * and its cache policies all keep working, which is what "as close as possible"
 * had to mean once the upstream lost the data.
 */
export class LaunchModel implements TLaunchModel {
  constructor(
    launch: GatewayLaunch,
    flightNumber: number,
    familyByRocket: Map<string, string>,
  ) {
    // The gateway has no per-launch route and no id, so the id has to be
    // derivable from the row itself or a deep link could never be resolved.
    this.id = launchId(launch);
    this.flightNumber = flightNumber;
    this.site = launch.pad ?? SITE_UNKNOWN;

    const rocketName = launch.rocket ?? namePart(launch.name, 0);
    this.rocket = {
      id: slug(rocketName),
      name: rocketName,
      type: familyByRocket.get(rocketName) ?? ROCKET_TYPE_UNKNOWN,
    };

    this.mission = {
      // No patch images exist on the gateway at all. Empty is the honest answer
      // and the one the UI already handles — `Header` falls back to its dog
      // avatar on a falsy image, so the page reads as designed rather than
      // showing a broken tile.
      missionPatchLarge: '',
      missionPatchSmall: '',
      name: namePart(launch.name, 1),
    };
  }

  id: string;
  flightNumber: number;
  site: string;
  rocket: TRocket;
  mission: TMission;
}

/* Helpers */
/** Shown where the gateway serves no launchpad, which is nearly every row. */
const SITE_UNKNOWN = 'Unknown';
const ROCKET_TYPE_UNKNOWN = 'Unknown';

/**
 * A launch name is `"<rocket> | <mission>"` on every row the gateway serves —
 * checked across all 101. A name without the separator is treated as the
 * mission, because that is the half the UI puts in its heading.
 */
const namePart = (name: string, index: number) => {
  const parts = name.split(' | ');
  if (parts.length < 2) return name.trim();

  return (parts[index] ?? name).trim();
};

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * The launch id, and the one derivation a booking depends on.
 *
 * 📌 It must be stable across refetches or a booked trip would lose its launch
 * on the next sync, so it is built only from fields that never change: the
 * launch date and its name. Verified unique across the gateway's whole window —
 * 101 launches, 101 distinct ids — and the date prefix keeps it unique even if
 * a name is ever reused.
 *
 * ⚠️ These ids do not match the old `api.spacexdata.com` uuids, so trips booked
 * against the dead API point at launches this one cannot resolve. `UserAPI`
 * already drops unresolvable trips rather than failing the profile.
 */
export const launchId = (launch: GatewayLaunch) =>
  `${launch.date_utc.slice(0, 10)}-${slug(launch.name)}`;

/** `/rockets` keyed by name, which is how a launch refers to its rocket now. */
export const rocketFamilies = (rockets: GatewayRocket[]) =>
  new Map(rockets.map((rocket) => [rocket.name, rocket.family]));

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
