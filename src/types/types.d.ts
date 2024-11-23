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
    query?: Record;
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
    favorites: Schema.Types.ObjectId[];
    level: number;
    profile_pic: string;
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
    publication: string;
    content: string;
    date: Date;
    score: number;
    deleted?: boolean
    type: string
}

export interface IGamePrimitive extends ApiData {
    slug: string
    title: string
    imageUrl: string
    description: string
    criticScore: number,
    userScore: number,
}

export interface Sites { 
    website: string
    reddit: string
    metacritic: string
}

export interface IGame extends IGamePrimitive {
    platforms: Schema.Types.ObjectId[],
    developers: Schema.Types.ObjectId[],
    publishers: Schema.Types.ObjectId[],
    genres: Schema.Types.ObjectId[]
    releaseDate: Date
    ageRating: Schema.Types.ObjectId
    sites: Sites
}

export interface GameSearchQuery {
    search?: string
    platforms?: number[]
    developers?: (string | number)[]
    publishers?: (string | number)[]
    genres?: (string | number)[]
    releaseYears?: [number, number]
}

export interface RouteGameSearchQuery extends GameSearchQuery {
    page: number
}

export interface ReviewCreate {
    publication: string
    content: string
    score: number
}

export interface ReviewResponse {
    _id: string
    game: Schema.Types.ObjectId;
    user: IUser;
    publication: string;
    content: string;
    date: string;
    score: number;
    type: string
    deleted?: boolean
}
// // Test:
// fetch(`${api}/search/`, {
//     search: 'poke',
//     platforms: [8, 9], // corresponds to DS and 3DS
//     developers: ['game freak'],
//     publishers: ['nintendo'],
//     genres: ['rpg'],
//     releaseYears: [2009, 2014],
// })


export interface GameDetailsQuery {
    id: number
}

export interface Mail {
    to: string;
    subject: string;
    html: string;
}

export interface CustomRequest extends Request {
    token: string | JwtPayload;
}