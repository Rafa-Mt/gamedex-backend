import { getGenres, getPlatforms } from "../controllers/misc";
import { buildRouter } from "../services/routeWrapper";
import { RouteCallbackParams, RouteParams } from "../types/types";
import { Router } from "express";

const router = Router();

const routes: RouteParams[] = [
    {
        method: "GET",
        path: "/genres",
        returnData: true,
        successMessage: "Found genres!",
        callback: getGenres,
    },
    {
        method: "GET",
        path: "/platforms",
        returnData: true,
        successMessage: "Found platforms!",
        callback: getPlatforms
    }
]

buildRouter(router, routes);

export default router