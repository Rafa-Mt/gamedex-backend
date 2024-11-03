import mongoose, { model, Schema, Document } from "mongoose";
import { IUser } from "../types";

export const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        deleted: { type: Boolean, required: true }
    },
    {
        statics: {
            'exclusiveFindById': async function (_id: string) {
                return await this.findOne({ $and: [{ _id }, { deleted: false }]});
            }
        }    
});

interface IUserWithMethods extends mongoose.Model<IUser> {
    exclusiveFindById(_id: string): Promise<IUser | null>
}

export const User = model<IUser, IUserWithMethods>('user', userSchema);
