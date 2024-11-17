import { model, Schema } from "mongoose";
import { IPasswordResetToken as IPasswordToken } from "../types/types";
import bcrypt from 'bcrypt';

export const passwordTokenSchema = new Schema<IPasswordToken>({
    username: {type: String, required: true, unique: true},
    token: {type: String, required: true, unique: true},
    createdAt: {type: Date, expires: '10m', default: Date.now}
});

export const PasswordToken = model<IPasswordToken>('passwordToken', passwordTokenSchema);
