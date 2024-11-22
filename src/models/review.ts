import { Model, model, Schema } from "mongoose";
import { IGame, IReview } from "../types/types";

export const reviewSchema = new Schema<IReview>({
    game: {type: Schema.Types.ObjectId, ref: "game", required: true},
    user: {type: Schema.Types.ObjectId, ref: "user", required: true},
    publication: {type: String, required: true},
    content: { type: String, required: true },
    date: { type: Date, required: true, default: new Date() },
    score: { type: Number, required: true },
    deleted: { type: Boolean, default: false },
    type: { type: String, required: true }
}, {
    statics: {
        getFromGame: async function (_id: string) {
            return await this.find({
                $and: [{ deleted: false }, { game: _id }]
            })
        },
        getFromUser: async function (user: string) {
            return await this.find({ $and: [{ user }, { deleted: false }]})
        }
    }
})

interface IReviewWithMethods extends Model<IReview> {
    getFromGame: (_id: string) => Promise<IReview | null>
    getFromUser: (user: string) => Promise<IReview[] | null>
}

export const Review = model<IReview, IReviewWithMethods>('review', reviewSchema);
