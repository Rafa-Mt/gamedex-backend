import { Schema, Document } from "mongoose";
import { z } from 'zod'
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface RouteParams {
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    callback: (RouteCallbackData) => Promise<Record>,
    bodySchema?: z.ZodObject,
    returnData?: boolean
    successMessage: string,
}

export interface RouteCallbackParams {
    body?: Record;
    params?: Record;
}

export interface SuccessResponse {
    success: string;
    data?: Record;
}

export interface ErrorResponse {
    error: string | Record;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    deleted: boolean;
    user_type: "player" | "critic";
    favorites: Schema.Types.ObjectId[]
}

export interface IPasswordResetToken extends Document {
    username: string;
    token: string;
    createdAt: Date;
}

interface ApiData extends Document {
    api_id: number;
}

export interface IApiMasterData extends ApiData {
    name: string;
    slug: string;
}

export interface IReview extends Document {
    game: Schema.Types.ObjectId;
    user: Schema.Types.ObjectId;
    title: string;
    comment: string;
    posting_date: Date;
    rating: number;
    deleted: boolean
}

export interface IGame extends ApiData {

}


export interface GameSearchQuery {
    search?: string
    platforms?: number[]
    developers?: (string | number)[]
    publishers?: (string | number)[]
    genres?: (string | number)[]
    releaseYear?: number
}

export interface Mail {
    to: string;
    subject: string;
    html: string;
}

export interface CustomRequest extends Request {
    token: string | JwtPayload;
}