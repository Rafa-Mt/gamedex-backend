import { Game } from "../models/game";
import * as service from "../services/game";
import { GameSearchQuery, IGame, IGamePrimitive, RouteCallbackParams, RouteGameSearchQuery } from "../types/types";

export const searchGame = async ({ params, query }: RouteCallbackParams) => {
    const individualKeys =  [ "search", "releaseYears" ]
    const groupKeys = [ "platforms", "developers", "publishers", "genres" ]

    const filteredQuery = Object.fromEntries(
    Object.entries(query)
    .filter(([k, v]) => [...individualKeys, ...groupKeys].includes(k))
    .map(([k, v]) => {
        return groupKeys.includes(k) ? [ k, (v as string).split(',') ] : [ k, v ]
    })) as GameSearchQuery

    // return {original: query, filtered: filteredQuery};
    // console.log(filteredQuery)
    const data: RouteGameSearchQuery = params;
    const pageSize = 20;
    // const inhouseData: IGamePrimitive[] = [];
    
    const [inhouseData, inhouseIDs] = await service.searchFromDB(filteredQuery, data.page, pageSize);

    if (inhouseData.length == pageSize) 
        return inhouseData
    
    // console.log(inhouseIDs)
    const apiResponse = await service.searchFromApi(filteredQuery, pageSize, data.page);
    const formattedApiData = apiResponse.results.map((game) => ({
        api_id: game.id,
        title: game.name,
        imageUrl: game.background_image,
        description: "",
        criticsScore: 0,
        userScore: 0
    })).filter((item) => !inhouseIDs.includes(item.api_id));

    const results = [...inhouseData, ...formattedApiData]

    return {
        page: Number(data.page),
        total_pages: Math.round(apiResponse.count / pageSize),
        result_count: results.length,
        results
    };
}

export const getGameDetails = async ({ params }: RouteCallbackParams) => {
    const id = Number(params.api_id);
    if (!id || isNaN(id))
        throw new Error('Undefined game id')
    console.log(id)
    const foundFromDB = await service.getDetailsFromDB(id);
    if (foundFromDB) 
        return foundFromDB;
    
    const foundFromApi = await service.getGameDetailsFromApi(id);
    const game = await Game.createFromApiResponse(foundFromApi);
    return game;
    // return Object.keys(game).
};

export const createHomePage = async ({}: RouteCallbackParams) => {
    const foundTopRated = await Game.find().sort({'userScore': "descending"});
    const topRated = foundTopRated.map((game, index) => ({
        id: game.api_id,
        ranking: index+1,
        imageUrl: game.imageUrl,
        title: game.title,
        description: game.description,
        criticScore: game.criticScore,
        userScore: game.userScore
    }))
    const foundFeatured = await Game.find().sort({'criticScore': "descending"});
    const featured = foundFeatured.map((game, index) => ({
        id: game.api_id,
        ranking: index+1,
        imageUrl: game.imageUrl,
        title: game.title,
        description: game.description,
        criticScore: game.criticScore,
        userScore: game.userScore
    }))
    const foundNewest = await Game.find().sort('descending')
    const cardGames = foundNewest.map((game, index) => ({
        id: game.api_id,
        ranking: index+1,
        imageUrl: game.imageUrl,
        title: game.title,
        description: game.description,
        criticScore: game.criticScore,
        userScore: game.userScore
    }))

    return { topRated, featured, cardGames }
}