import { z } from 'zod'

export const reviewCreateSchema = z.object({
    publication: z.string(),
    content: z.string(),
    score: z.number().min(0).max(100)
})

export const favoriteAddSchema = z.object({
    game_api_id: z.number()
})

export const profilePicChangeSchema = z.object({
    url: z.string().url()
})