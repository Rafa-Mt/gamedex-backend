import { Router } from "express";
import { authMiddleware } from "../services/auth";
import userRoutes from './user'
import authRoutes from './auth'
import gameRoutes from './game'
import reviewRoutes from './reviews'
import miscRoutes from './misc'

const router = Router()
export default router;

router.use('/auth', authRoutes);
router.use('/user', authMiddleware, userRoutes);
router.use('/game', authMiddleware, gameRoutes);
router.use('/review', reviewRoutes)
router.use('/misc', miscRoutes)