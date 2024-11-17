import { z } from 'zod'

export const registerSchema = z.object({
    username: z.string().min(3).max(20).refine(s => !s.includes(' '), 'No Spaces!'),
    email: z.string().email().max(35),
    password: z.string().min(8).max(20).refine(s => !s.includes(' '), 'No Spaces!'),
    user_type: z.string().refine((s) => ["player", "critic"].includes(s), 'Invalid user type')
});

export const loginSchema = z.object({
    username: z.string().min(3).max(20).refine(s => !s.includes(' '), 'No Spaces!'),
    password: z.string().min(8).max(20).refine(s => !s.includes(' '), 'No Spaces!')
})

export const passwordResetSchema = z.object({
    email: z.string().email().max(25),
    newPassword: z.string().min(8).max(20),
    token: z.string()
});

export const resetRequestSchema = z.object({
    email: z.string().email().max(35)
});

export const tokenCheckSchema = z.object({
    token: z.string()
})