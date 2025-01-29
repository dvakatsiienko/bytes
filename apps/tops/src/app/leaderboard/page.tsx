/* Core */
import NextImage from 'next/image';

const LeaderboardPage = async () => {
    // https://api.rawg.io/docs/#operation/creators_list
    const leaderboardData = await fetch(`https://api.rawg.io/api/creators?key=${ process.env.RAWG_KEY }&page_size=10`);
    const result: Response = await leaderboardData.json();

    const gameListJSX = result.results.map((creator) => {
        return (
            <div key = { creator.id }>
                <NextImage alt = { creator.name } height = { 100 } src = { creator.image } width = { 100 } />
                <h2>{creator.name}</h2>
                <p>{creator.released}</p>
            </div>
        );
    });

    return (
        <main className = 'grid min-h-screen place-items-center'>
            <h1>Leaderboard</h1>

            <section className = 'mx-auto pt-24'>{gameListJSX}</section>
        </main>
    );
};

export default LeaderboardPage;

/* Types */
interface Response {
    count:    number,
    next:     string,
    previous: string,
    results:  Creator[],
}

interface Creator {
    id:               number,
    name:             string,
    image:            string,
    image_background: string,
    released:         string,

    //
}
