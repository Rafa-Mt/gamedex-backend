import { apiDataSchema, apiGameDetails, apiGameSearch } from "../schemas/apiresponses";
import { getFromApi } from "./externalapi"
import { ApiGameDetails, ApiGameSearch, ApiResult, ApiData } from "../types/apitypes";
import { GameSearchQuery, IGame } from "../types/types"
import { Game } from "../models/game";
import { resourceLimits } from "worker_threads";

export const searchFromApi = async (query: GameSearchQuery, page_size: number = 10, page: number = 1,): Promise<ApiResult<ApiGameSearch>> => {
    // console.log(query)
    const formattedQuery = Object.fromEntries(Object.entries(query).map(([k, value]) => {
        const key = k as keyof GameSearchQuery;
        if (key == 'search') return [key, value.replace(' ', '-')];
        if (key == 'releaseYears') return ['dates', `${value[0]}-01-01,${value[1]}-12-31`];
        // console.log(key,value)
        return [key, value.map((val: string | number) => val.toString().replace(' ', '-')).join(",")]
    }))
    // console.log(formattedQuery)
    const response = await getFromApi('/games', {...formattedQuery, page, page_size}, apiGameSearch, 'list')
    // console.dir(response, {depth: 6})
    // console.log({api: response.count})
    return {
        ...response,
        results: response.results.map((game: ApiGameSearch) => {
            return {
                ...game,
                platforms: game.platforms.map((plt: any) => plt.platform)
            }
        })
    } 
}

const $lookup = [ "platforms", "developers", "publishers", "genres" ].map((k) => ({
    $lookup: {
        from: k,
        localField: k,
        foreignField: '_id',
        as: k
    }     
}))

export const searchFromDB = async (params: GameSearchQuery, page: number, size: number): Promise<[IGame[], number[]]> => {
    const $match = {
        $and: Object.entries(params).map(([k, v]) => {
            if (k === 'search')
                return { $or: [{title: { $regex: v, $options: 'i' }}, {slug: { $regex: v, $options: 'i' }}] }

            if (k === 'releaseYears')
                return { releaseDate: { $gte: new Date(`${v[0]}-01-01`), $lte: new Date(`${v[1]}-12-31`) } }

            if (k === 'developers') 
                return v.map((elem: string | number) => ({$or: [{ 'developers.name': elem }, { 'developers.api_id': Number(elem) }]}))

            if (k === 'publishers') 
                return v.map((elem: string | number) => ({$or: [{ 'publishers.name': elem }, { 'publishers.api_id': Number(elem) }]}))

            if (k === 'platforms')
                return v.map((elem: string | number) => ({ 'publishers.api_id': Number(elem) }))

            if (k === 'ageRating') 
                return v.map((elem: string | number) => ({$or: [{ 'ageRating.name': elem }, { 'ageRating.api_id': Number(elem) }]}))

        }).filter((param) => !!param).flat()
    }

    const $replaceRoot = {
            newRoot: {
                api_id: "$api_id", 
                title: "$title", 
                imageUrl: "$imageUrl",

                criticScore: "$criticScore",
                userScore: "$userScore",
                description: "$description"
            }
        }
    
    
    const $skip = (Number(page) - 1) * size
    const $limit = size

    const aggregate = [...$lookup, { $match }, { $replaceRoot }, { $skip }, { $limit }];

    const result = await Game.aggregate(aggregate);
    const allIDs = await Game.aggregate([...$lookup, { $match }, { $replaceRoot: { newRoot: { id: "$api_id" } } }])

    return [result as IGame[], allIDs.map((doc) => doc.id)]
}

export const getDetailsFromDB = async (api_id: number): Promise<IGame> => {
    const $match = { api_id };
    const $replaceRoot = {
        newRoot: {
            api_id: "$api_id", 
            title: "$title", 
            imageUrl: "$imageUrl",
            developers: "$developers.name", 
            publishers: "$publishers.name", 
            genres: "$genres.name", 
            ageRating: "$ageRating.name", 
            sites: "$sites",
            criticScore: "$criticScore",
            userScore: "$userScore",
            description: "$description"
        }
    }
    const aggregate = [ { $match }, ...$lookup, { $replaceRoot } ]
    const result = await Game.aggregate(aggregate);

    return result[0] as IGame;
}

export const getGameDetailsFromApi = async (id: number) => {
    const details = await getFromApi(`/games/${id}`, {}, apiGameDetails, 'details') as ApiGameDetails
    return {
        ...details,
        platforms: details.platforms.map((plt: any) => plt.platform)
    }
}
