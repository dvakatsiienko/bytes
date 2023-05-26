/* Instruments */
import { getVisits } from '@/api';

export const Stats = async () => {
    const visits = await getVisits();

    return (
        <>
            <span>Visits ALL: {visits?.visitsAll}</span>
            <span>Visits UNIQUE: {visits?.visitsUnique}</span>
            <span>IP: {visits?.ip}</span>
            <span>CIP: {visits?.cip}</span>
        </>
    );
};
