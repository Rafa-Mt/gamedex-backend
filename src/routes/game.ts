import { Router } from "express";
import { RouteParams } from "../types/types";
import { getGameDetails, searchGame } from "../controllers/game";
import { buildRouter } from "../services/routeWrapper";

const router = Router();

const routes: RouteParams[] = [
    {
        method: "GET",
        path: "/details/:api_id",
        returnData: true,
        successMessage: "Found game!",
        callback: getGameDetails
    },
    {
        method: "GET",
        path: '/search/:page',
        returnData: true,
        successMessage: "Found games!",
        callback: searchGame
    }
]

buildRouter(router, routes);
export default router;