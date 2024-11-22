import { AgeRating } from "../models/age_rating"
import { Genre } from "../models/genre"
import { Platform } from "../models/platform"
import { apiDataSchema } from "../schemas/apiresponses"
import { getFromApi } from "../services/externalapi"
import { IApiMasterData, RouteCallbackParams } from "../types/types"

export const getPlatforms = async () => {
    // const apiGenres1 = await getFromApi('/platforms', { limit: 30, page: 1 }, apiDataSchema, "list");
    // const apiGenres2 = await getFromApi('/platforms', { limit: 30, page: 2 }, apiDataSchema, "list");

    // [...apiGenres1.results, ...apiGenres2.results].forEach((result: Record<string, string | number>) => {
    //     const genre = new Platform();
    //     genre.api_id = result.id as number;
    //     genre.name = result.name as string;
    //     genre.slug = result.slug as string;
    //     genre.save();
    // })
    return await Platform.find();
}

export const getGenres = async ({  }: RouteCallbackParams) => {
    // const apiGenres = await getFromApi('/genres', { limit: 51 }, apiDataSchema, "list");

    // apiGenres.results.forEach((result: Record<string, string | number>) => {
    //     const genre = new Genre();
    //     genre.api_id = result.id as number;
    //     genre.name = result.name as string;
    //     genre.slug = result.slug as string;
    //     genre.save();
    // })
    return await Genre.find();
}

export const getAgeRatings = async () => {
    return await AgeRating.find();
}