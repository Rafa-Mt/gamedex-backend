import { apiDataSchema, apiGameDetails, apiGameSearch } from "../schemas/apiresponses";
import { getFromApi } from "../services/externalapi"
import { ApiGameDetails, ApiGameSearch, ApiResult, ApiData } from "../types/apitypes";
import { GameSearchQuery } from "../types/types"

export const searchGames = async (query: GameSearchQuery, page_size: number = 10, page: number = 1,): Promise<ApiResult<ApiGameSearch>> => {
    const formattedQuery = Object.fromEntries(Object.entries(query).map(([k, value]) => {
        const key = k as keyof GameSearchQuery;
        if (key == 'search') return [key, value.replace(' ', '-')];
        if (key == 'releaseYear') return ['dates', `${value}-01-01,${value}-12-31`];
        
        return [key, value.map((val: string | number) => val.toString().replace(' ', '-')).join(",")]
    }))
    console.log(formattedQuery)
    const response = await getFromApi('/games', {...formattedQuery, page, page_size}, apiGameSearch, 'list')
    // console.dir(response, {depth: 6})

    return response;
}

export const getGameDetails = async (id: number) => {
    return await getFromApi(`/games/${id}`, {}, apiGameDetails, 'details') as ApiGameDetails
}

export const getDevelopers = async () => {
    return await getFromApi('/developers', { page_size: 100 }, apiDataSchema, 'list') as ApiData[]
}

export const getPublishers = async () => {
    return await getFromApi('/publishers', { page_size: 100 }, apiDataSchema, 'list') as ApiResult<ApiData>
}

export const getPlatforms = async () => {
    return await getFromApi('/platforms', { page: 1, page_size: 100 }, apiDataSchema, 'list') as ApiResult<ApiData>
}

export const getGenres = async () => {
    return await getFromApi('/genres', {page: 1, page_size: 100}, apiDataSchema, 'list')
}

const test = async () => {
    // const publishers = await getPublishers()
    // console.log(publishers)
    // const developers = await getDevelopers()
    // console.log(developers)
    // const genres = await getGenres()
    // console.log(genres)
    // const gameListResponse = await searchGames({
    //     search: 'black ops',
    //     // developers: ['game-freak'],
    //     // platforms: [8, 9],
    //     // publishers: ['bandai', 'fromsofware'],
    //     // releaseYear: 2009
    // }, 15)
    // const gameList = gameListResponse.results
    // console.dir(gameList, {depth: 6})
 
    const gameDetails = await getGameDetails(754744)
    console.dir(gameDetails, {depth: 6})
    // const platforms = await getPlatforms();
    // console.dir({length: platforms.results.length, results: platforms}, {depth: 6})
}

test()
