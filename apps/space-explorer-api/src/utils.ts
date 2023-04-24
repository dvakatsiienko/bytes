/* Core */
import { Trip } from '@prisma/client';

/* Instruments */
import { LaunchModel } from './datasources';

export const paginate = ({
    after: cursor,
    pageSize = 20,
    results,
    getCursor = () => null,
}: Options) => {
    if (pageSize < 1) return [];

    if (!cursor) return results.slice(0, pageSize);

    const cursorIndex = results.findIndex(item => {
        const itemCursor = item.flightNumber ? item.flightNumber : getCursor();

        return itemCursor ? cursor === itemCursor : false;
    });

    if (cursorIndex >= 0) {
        if (cursorIndex === results.length - 1) {
            return [];
        }

        return results.slice(
            cursorIndex + 1,
            Math.min(results.length, cursorIndex + 1 + pageSize),
        );
    }
    return results.slice(0, pageSize);
};

/* Types */
interface Options {
    after: number;
    pageSize: number;
    results: LaunchModel[];
    getCursor?: () => null;
}

export const injectLaunchesIntoTrips = (
    trips: Trip[],
    launches: LaunchModel[],
) => {
    const finalTrips = trips.map(trip => {
        const launch = launches.find(_launch => _launch.id === trip.launchId);

        if (!launch) {
            throw new Error('Launch for a trip not found.');
        }

        return { ...trip, launch };
    });

    return finalTrips;
};
