import express from 'express'
import { resetRequestSchema } from "../schemas/auth";
import { buildRouter } from "../services/routeWrapper";
import { RouteParams } from "../types/types";
import { addFavorite, changeUserEmail, deleteUser, getFavorites, getUserData, removeFavorite, setProfilePic } from "../controllers/user";
import { favoriteAddSchema, profilePicChangeSchema } from '../schemas/models';

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
    },
    {
        method: "GET",
        path: "/:user_id/favorites",
        returnData: true,
        successMessage: "Found games!",
        callback: getFavorites
    },
    {
        method: "POST",
        path: "/:user_id/add-favorite",
        returnData: false,
        successMessage: "Game added to favorites!",
        bodySchema: favoriteAddSchema,
        callback: addFavorite
    },
    {
        method: "POST",
        path: "/:user_id/remove-favorite",
        returnData: false,
        successMessage: "Game deleted from favorites!",
        bodySchema: favoriteAddSchema,
        callback: removeFavorite
    },
    {
        method: "POST",
        path: "/:user_id/profile-pic",
        returnData: false,
        successMessage: "Profile picture changed successfully!",
        bodySchema: profilePicChangeSchema,
        callback: setProfilePic
    }
];

buildRouter(router, routes);
export default router;
