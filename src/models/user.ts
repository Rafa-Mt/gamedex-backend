import { model, Schema } from "mongoose";
import { IUser } from "../types";

export const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    deleted: { type: Boolean, required: true }
});


export const User = model<IUser>('user', userSchema);
