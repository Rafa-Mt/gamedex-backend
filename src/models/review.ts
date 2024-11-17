import { Model, model, Schema } from "mongoose";
import { IReview } from "../types/types";

export const reviewSchema = new Schema<IReview>({
    game: {type: Schema.Types.ObjectId, ref: "game", required: true},
    user: {type: Schema.Types.ObjectId, ref: "user", required: true},
    title: {type: String, required: true},
    comment: { type: String, required: true },
    posting_date: { type: Date, required: true, default: new Date() },
    rating: { type: Number, required: true },
    deleted: { type: Boolean, required: true }
}, {
    statics: {
        getFromGame: async function (_id: string) {
            return await this.find({
                $and: [{ deleted: false }, { game: _id }]
            })
        }
    }
})

interface IReviewWithMethods extends Model<IReview> {
    getFromGame: (_id: string) => Promise<IReview | null>
}

export const review = model<IReview, IReviewWithMethods>('review', reviewSchema);
