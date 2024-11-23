import { Schema, Types } from "mongoose";
import { Review } from "../models/review"
import { IReview, ReviewCreate, ReviewResponse } from "../types/types"
import { Game } from "../models/game";
import { User } from "../models/user";

export const createReview = async (user: unknown, game: unknown, type: string, { publication, content, score }: ReviewCreate) => {
    const review = new Review();

    review.user = user as Schema.Types.ObjectId
    review.game = game as Schema.Types.ObjectId;
    review.publication = publication;
    review.content = content;
    review.score = score
    review.date = new Date();
    review.type = type;

    await review.save();
}

export const getReviews = async (game: number, page: number, type: string): Promise<[ReviewResponse[], number, number]> => {
    const size = 10;
    const offset = (page-1) * size
    const foundGame = await Game.getByApiId(game)
    if (!foundGame)
        throw new Error('Game not found');

    const foundReviews = await Review.find({$and: [
        { game: foundGame._id }, { deleted: false }, { type }
    ]})
    .limit(size)
    .skip(offset)
    .populate('user')
    // .sort({'date': 1})
    // .exec()
    const count = await Review.find({$and: [
        { game: foundGame._id }, { deleted: false }, { type }
    ]})

    return [foundReviews as unknown as ReviewResponse[], Math.round(count.length / size), foundReviews.length];
}

export const deleteReview = async () => {

}