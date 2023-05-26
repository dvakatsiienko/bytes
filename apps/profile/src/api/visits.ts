export const getVisits = async (): Promise<GetVisitsResponse | null> => {
    try {
        const visitsJSON = await fetch('http://localhost:3000/api/visits', { method: 'GET' }).then((res) => res.text());
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
