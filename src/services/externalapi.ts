import { config as dotenv } from 'dotenv'
import { z, ZodSchema } from 'zod';

dotenv();


export const getFromApi = async (route: string, params: Record<string, string | number | boolean>, schema: ZodSchema, type: 'details' | 'list') => {
    try {    
        const baseURL = "https://api.rawg.io/api";
        const formattedParams = new URLSearchParams({
            key: process.env.RAWG_API_KEY as string,
            ...Object.fromEntries(
                Object.entries(params).map(
                    ([key, value]) => [key, value.toString()]
                )
            )
        })
        
        const fullURL = `${baseURL}${route}?${formattedParams}`
        const result = await fetch(fullURL, { headers: { 'Accept': 'Application/JSON' } });
        const json = await result.json()
     
        // console.log(json)

        if (type == 'list') {
            const listSchema = z.object({
                count: z.number().int().optional(),
                next: z.union([ z.string(), z.null()]).optional(),
                previous: z.union([z.string(), z.null()]).optional(),
                results: z.union([z.array(schema), z.null()]).optional()
            });
            return listSchema.parse({
                count: json.count ?? 0,
                next: json.next ?? '',
                previous: json.previous ?? '',
                results: json.results ?? [],
            }) 
            
        }
        return schema.parse(json)

    }
    catch (error) {
        console.dir(error, { depth: 10 })
        throw new Error(`Failed to get data from api`)
    }

}

// const test = async () => {
//     // const gameId = 282825
//     const game = await apiQuery(`/games`, { developers: 'game-freak', page: 1, page_size: 3 }, apiGameSearch)
//     console.dir(game, { depth: 6 })
// }

// test();
