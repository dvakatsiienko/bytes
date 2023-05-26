export const getVisits = async (): Promise<GetVisitsResponse | null> => {
    try {
        const visitsJSON = await fetch(`${ process.env.NEXT_PUBLIC_API_URL }/api/visits`, {
            method: 'GET',
            next:   { revalidate: 1 },
        }).then((res) => res.text());
        const visits = JSON.parse(visitsJSON);

        return visits;
    } catch (error) {
        console.error(error);

        return null;
    }
};

/* Types */
export interface GetVisitsResponse {
    ip:           string | null,
    visitsAll:    number | null,
    visitsUnique: number,
}
