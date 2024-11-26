import { Model, Document, model, Schema} from "mongoose";
import { IReview, IUser } from "../types/types";
import { Review } from "./review";

export const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        deleted: { type: Boolean, required: true },
        user_type: { type: String, required: true },
        favorites: [{ type: Schema.Types.ObjectId, ref: 'game' }],
        level: { type: Number, default: 0 },
        profile_pic: { type: String, default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" }
    },
    {
        statics: {
            exclusiveFindById: async function (_id: string) {
                return await this.findOne({ $and: [{ _id }, { deleted: false }]});
            }
        },
        methods: {
            levelUp: async function (): Promise<void> {
                const comments = await Review.getFromUser(this._id as string);
                const exp = comments ? comments.length : 0;
                const level = 5 * (Math.pow(exp, 1/3));
                console.log(`User leveled up (${this.level} -> ${level})`);
                this.level = level;
            }
        }
    }
);

export interface IUserWithMethods extends Model<IUser> {
    exclusiveFindById(_id: string): Promise<IUser | null>
    getAllComments: () => Promise<IReview[] | null> 
    levelUp: () => Promise<void>;
}

export const User = model<IUser, IUserWithMethods>('user', userSchema);
