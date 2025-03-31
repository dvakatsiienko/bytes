/* Core */
import NextImage from 'next/image';

const GamesPage = async () => {
    // https://api.rawg.io/docs/#tag/genres
    const gameData = await fetch(`https://api.rawg.io/api/games?key=${ process.env.RAWG_KEY }`);
    const result: Response = await gameData.json();

    const gameListJSX = result.results.map((game) => {
        return (
            <div key = { game.id }>
                <NextImage alt = { game.name } height = { 100 } src = { game.background_image } width = { 100 } />
                <h2>{game.name}</h2>
                <p>{game.released}</p>
            </div>
        );
    });

    return (
        <main className = 'grid min-h-screen'>
            <h1>Games</h1>

            <section className = 'mx-auto pt-24 overflow-y-auto'>{gameListJSX}</section>
        </main>
    );
};

export default GamesPage;

/* Types */
interface Response {
    count:    number,
    next:     string,
    previous: string,
    results:  Game[],
}

interface Game {
    id:               number,
    name:             string,
    background_image: string,
    released:         string,

    //
}
