import { IGame, RouteCallbackParams } from "../types/types";
import * as service from '../services/review'
import { IUserWithMethods, User } from "../models/user";
import moment from "moment";
import { Review, reviewSchema } from "../models/review";
import { Game } from "../models/game";

const recalcScore = async (game: IGame, type: string) => {
    const finalScores = await Review.find({ $and: [
        { game: game._id }, { deleted: false }, { type }
    ] })
    .select(['score'])

    console.log('Final scores: ', finalScores)

    if (!finalScores) {
        if (type === "player")
            game.userScore = 0
        else
            game.criticScore = 0

        await game.save();
        return
    }

    if (finalScores.length === 1) {
        if (type === "player")
            game.userScore = finalScores[0].score
        else
            game.criticScore = finalScores[0].score

        await game.save();
    }

    const newScore = finalScores.map((doc) => doc.score).reduce((total, actual) => actual+total) / finalScores.length;

    console.log('New score: ', newScore)

    if (type === "player")
        game.userScore = newScore
    else
        game.criticScore = newScore

    await game.save()
}

export const createReview = async ({ params, body }: RouteCallbackParams) => {
    const { user_id, game_id }: Record<string, string> = params;
    const numGameID = Number(game_id);
    if (!numGameID || isNaN(numGameID) || !user_id) 
        throw new Error('invalid params format');

    const foundGame = await Game.getByApiId(numGameID)
    if (!foundGame)
        throw new Error('Game not found');

    const foundUser = await User.findById(user_id);
    if (!foundUser)
        throw new Error('User not found');

    const overlappingComment = await Review.findOne({
        $and: [{user: foundUser._id}, { game: foundGame._id }, { deleted: false }]
    })
    if (overlappingComment) 
        throw new Error('Already reviewed this game')

    await service.createReview(foundUser._id, foundGame._id, foundUser.user_type, body);
    await recalcScore(foundGame, foundUser.user_type);
    await (foundUser as unknown as IUserWithMethods).levelUp();
}

export const getReviews = async ({ params }: RouteCallbackParams) => {
    const { user_id, game_id, page, type }: Record<string, string> = params;
    const numGameID = Number(game_id);
    if (!numGameID || isNaN(numGameID) || !user_id) 
        throw new Error('invalid params format');

    const user = await User.findById(user_id);
    if (!user)
        throw new Error('User not found');

    const numPage = page ? Number(page) : 1;
    if (!['player', 'critic'].includes(type))
        throw new Error('Invalid review type');

    const [reviews, total, resultCount] = await service.getReviews(numGameID, numPage, type);
    return {
        resultCount,
        totalPages: total,
        comments: reviews.map((review) => ({
            id: review._id,
            username: review.user.username,
            date: moment(review.date).format('DD-MM-YYYY'),
            publication: review.publication,
            content: review.content,
            score: review.score,
            type: review.type,
            isOwnReview: review.user.username == user.username
        }))
    }
}

export const deleteReviews = async ({ params }: RouteCallbackParams) => {
    const { user_id, game_id }: Record<string, string> = params;
    const numGameID = Number(game_id);
    
    if (!numGameID || isNaN(numGameID) || !user_id)
        throw new Error("Invalid params")

    const foundUser = await User.findById(user_id)
    if (!foundUser)
        throw new Error('User not found')
    await (foundUser as unknown as IUserWithMethods).levelUp();

    const foundGame = await Game.getByApiId(numGameID)
    if (!foundGame)
        throw new Error("Game not found")
    
    const changedReview = await Review.findOneAndUpdate({ $and: [
        { user: user_id }, { game: foundGame._id }, { deleted: false }
    ]}, { deleted: true })

    if (!changedReview)
        throw new Error('Failed to delete review')

    await recalcScore(foundGame, changedReview.type);
 
}