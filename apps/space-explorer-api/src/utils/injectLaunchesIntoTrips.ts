
import type { Trip } from '../lib/prisma-client';


import type { LaunchModel } from '../datasources';

export const injectLaunchesIntoTrips = (trips: Trip[], launches: LaunchModel[]) => {
    const finalTrips = trips.map((trip) => {
        const launch = launches.find((_launch) => _launch.id === trip.launchId);

        if (!launch) {
            throw new Error('Launch for a trip not found.');
        }

        return { ...trip, launch };
    });

    return finalTrips;
};
