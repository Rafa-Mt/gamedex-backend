import { Router } from "express";
import { RouteParams } from "../types/types";
import { buildRouter } from "../services/routeWrapper";
import { createReview, deleteReviews, getReviews } from "../controllers/review";
import { reviewCreateSchema } from "../schemas/models";

const router = Router();

const routes: RouteParams[] = [
    {
        method: "POST",
        path: "/:user_id/:game_id",
        returnData: false,
        successMessage: "Created review!",
        callback: createReview,
        bodySchema: reviewCreateSchema
    },
    {
        method: "GET",
        path: "/:user_id/:game_id/:type/:page",
        returnData: true,
        successMessage: "Got reviews!",
        callback: getReviews,
    },
    {
        method: "DELETE",
        path: "/:user_id/:game_id",
        returnData: false,
        successMessage: "Review Deleted!",
        callback: deleteReviews
    }
]

buildRouter(router, routes);
export default router;