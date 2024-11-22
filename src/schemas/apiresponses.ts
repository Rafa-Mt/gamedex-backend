import { z } from "zod";
import { ApiGameDetails, ApiGameSearch } from "../types/apitypes";
import { ApiData } from "../types/apitypes";
import { platform } from "os";

export const apiDataSchema: z.ZodSchema<ApiData> = z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
})

const apiPlatformSchema = z.object({
    platform: apiDataSchema
})

const partialApiGameSearchSchema = z.object({
    platforms: z.array(apiPlatformSchema),
    released: z.union([z.string(), z.null()]),
    background_image: z.union([z.string(), z.null()]),
    esrb_rating: z.union([apiDataSchema, z.null()]),
    genres: z.array(apiDataSchema)
})

const partialApiGameDetailsSchema = z.object({
    description: z.string(),
    website: z.string(),
    reddit_url: z.string(),
    metacritic_url: z.string(),
    developers: z.array(apiDataSchema),
    genres: z.array(apiDataSchema),
    publishers: z.array(apiDataSchema),
})

export const apiGameSearch: z.ZodSchema<ApiGameSearch> = z.intersection(apiDataSchema, partialApiGameSearchSchema);

export const apiGameDetails: z.ZodSchema<ApiGameDetails> = z.intersection(apiGameSearch, partialApiGameDetailsSchema)

