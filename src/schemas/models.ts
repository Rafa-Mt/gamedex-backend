import { z } from 'zod'

export const reviewCreateSchema = z.object({
    publication: z.string(),
    content: z.string(),
    score: z.number().min(0).max(100)
})