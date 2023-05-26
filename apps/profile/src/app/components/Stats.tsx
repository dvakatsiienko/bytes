/* Instruments */
import { getVisits } from '@/api';

export const Stats = async () => {
    // const visits = await getVisits();
    const visitsJSON = await fetch(`${ process.env.NEXT_PUBLIC_API_URL }/api/visits`, {
        method: 'GET',
        // cache:  'no-store',
        next:   { revalidate: 1 },
    }).then((res) => res.text());
    const visits = JSON.parse(visitsJSON);

    return (
        <>
            <span>Visits ALL: {visits?.visitsAll}</span>{' '}
            <span>Visits UNIQUE: {visits?.visitsUnique}</span> <span>IP: {visits?.ip}</span>
        </>
    );
};
