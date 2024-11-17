import express from 'express'
import { resetRequestSchema } from "../schemas/auth";
import { buildRouter } from "../services/routeWrapper";
import { RouteParams } from "../types/types";
import { changeUserEmail, deleteUser, getUserData } from "../controllers/user";

const router = express.Router();

const routes: RouteParams[] = [
    {
        method: "DELETE",
        path: "/:_id",
        returnData: false,
        successMessage: "User deleted successfully",
        callback: deleteUser
    },
    {
        method: "PUT",
        path: '/:user_id/change-email',
        returnData: false,
        successMessage: "Email changed successfully!",
        bodySchema: resetRequestSchema,
        callback: changeUserEmail
    },
    {
        method: "GET",
        path: "/:_id",
        returnData: true,
        successMessage: "User found!",
        callback: getUserData
    }
];

buildRouter(router, routes);

export default router;
