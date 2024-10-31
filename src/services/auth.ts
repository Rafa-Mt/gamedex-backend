import { compareSync, hash } from "bcrypt";
import { User, userSchema } from "../models/user";
import { sendMessage } from "./mailer";
import { randomBytes } from "crypto";
import { PasswordToken } from "../models/passwordResetToken";
import { sign, Secret, verify } from 'jsonwebtoken'
import {config as dotenv} from 'dotenv'
import { Request, Response, NextFunction } from "express"; 
import { CustomRequest } from "../types";

dotenv();

const saltRounds = 8

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) 
        user.password = await hash(user.password, saltRounds);
    
    next();
});

export const checkPassword = async (user: {username: string, password: string}) => {
    const { username, password } = user;
    try {
        const foundUser = await User.findOne({ $and: [{ username }, {deleted: false}]});

        if (!foundUser) throw new Error('Invalid credentials'); 

        const isMatch = compareSync(password, foundUser.password);

        if (isMatch) {
            // console.log(foundUser)
            return foundUser
        } 
        else throw new Error('Invalid credentials');
        
    } 
    catch (error) {
        throw error;
    }
}

export const checkToken = async (token: string, username?: string) => {
    return await PasswordToken.findOne({ $or: [{ token: token.toLowerCase() }, { username }] });
}

const createToken = async (username: string, attempt: number = 0): Promise<string> => {
    const maxAttempts = 10;

    return new Promise( async (resolve, reject) => {
        if (attempt >= maxAttempts) 
            return reject("Could not generate token, please try again later")
        
        const token = randomBytes(3).toString("hex");
        const foundToken = await checkToken(token, username);

        if (foundToken?.username === username) 
            return reject('Token already sent')
        
        if (foundToken)
            return resolve(await createToken(username, attempt + 1));
        
        return resolve(token);
    });
}

const tokenMailFormat =  (token: string) => `
    <div style="font-family: Arial, sans-serif; background-color: #EBEBD3; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 50px auto; background-color: #F7F7ED; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); padding: 20px; text-align: center;">
            <h1 style="color: #FA7921;">TlasNote: Password Reset</h1>
            <p style="color: #3C3C3B; line-height: 1.5;">We have received a request to reset your account password. If you did not request this change, you can ignore this message.</p>
            <p style="color: #3C3C3B; line-height: 1.5;">Below is your verification token:</p>
            <div style="display: inline-block; margin: 20px 0; padding: 10px; background-color: #FDCDAC; color: #FA7921; font-weight: bold; border: 1px solid #bce8f1; border-radius: 5px; font-size: 2rem">
                ${token.toUpperCase()}
            </div> 
            <p style="color: #3C3C3B; line-height: 1.5;">Use this token to reset your password. It will expire if not used within 10 minutes</p>
            <p style="color: #3C3C3B; line-height: 1.5;">Best regards,<br>The TLAS Team</p>
            <div style="margin-top: 30px; font-size: 0.9em; color: #1C1C1B;">
                <p>&copy; 2024 TLAS. All rights reserved.</p>
            </div>
        </div>
    </div>`;

export const sendToken = async (email: string) => {
    try {
        const tokens = await PasswordToken.findOne({ email });

        if (tokens)
            throw new Error('Key already sent')

        const foundUser = await User.findOne({ email });
        
        if (!foundUser) 
            throw new Error('User not found'); 

        const token = await createToken(foundUser.username);

        const tokenEntry = new PasswordToken({ username: foundUser.username, token});
        await tokenEntry.save();

        sendMessage({
            to: foundUser.email,
            subject: "Password Reset Token",
            html: tokenMailFormat(token)
        })
    }
    catch (error) {
        throw error;
    }
}

export const register = async (user: { username: string, email: string, password: string }) => {
    const { username, email, password } = user;
    try {   

        const overlappingEmail = await User.findOne({$and: [{ email }, {deleted: false}]});
        
        const overlappingUser = await User.findOne({$and: [{ username }, {deleted: false}]});

        // console.log({overlappingEmail, overlappingUser})

        if (overlappingEmail && overlappingUser) 
            throw new Error('Username already in use')

        if (overlappingEmail)
            throw new Error('Email already in use');

        if (overlappingUser)    
            throw new Error('Username already in use');
        
        const hashedPassword = await hash(password, saltRounds);
        const newUser = new User({username, email, password: hashedPassword, deleted:false});
        await newUser.save();
    }
    catch (error) {
        throw error;
    }
}

export const changePassword = async (data: {email: string, newPassword: string, token: string}) => {
    return new Promise( async (resolve, reject) => {
        const { email, newPassword, token } = data;
        try {
            const userToChange = await User.findOne({ $and: [{ email }, {deleted: false}]});
            if (!userToChange) throw new Error('User not found'); 
            
            const tokenChecker = await checkToken(token);
            if (!tokenChecker) throw new Error('Invalid token');
            
            const hashedPassword = await hash(newPassword, saltRounds);
            userToChange.password = hashedPassword;
            await userToChange.save();
            
            await PasswordToken.deleteOne({token});
            resolve(true);
        }
        catch (error) {
            reject(error);
        }
    })
}

export const login = async (user: {username: string, password: string}) => {
    try {   
        const userCheck = await checkPassword(user);
        const token = sign({_id: userCheck._id?.toString(), username: userCheck.username, email: userCheck.email}, process.env.JWT_SECRET_KEY as Secret, {expiresIn: '5 days'});

        const {_id, username, email} = userCheck;
        return { user: { _id, username, email }, token }
    }
    catch (error) {
        throw error;
    }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('Token not found');
        const decodedToken = verify(token, process.env.JWT_SECRET_KEY as Secret);
        (req as CustomRequest).token = decodedToken;

        next();
    }
    catch (error) {
        console.error(error);
        res.status(400).json({error: 'User not logged in'});
    }
}