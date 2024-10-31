import { loginSchema, passwordResetSchema, registerSchema, resetRequestSchema, tokenCheckSchema } from "../schemas/auth";
import { Router } from "express";
import { changePassword, checkToken, login, register, sendToken } from "../services/auth";
import { FormatError, getErrorMessage } from "../services/utils";
import { config as dotenv } from 'dotenv'

const router = Router();
export default router;

dotenv();

router.post('/login', async (req, res) => {
    try {
        const body = loginSchema.safeParse(req.body);
        if (!body.success) 
            throw new FormatError(JSON.stringify(body.error.flatten()))
        const foundUser = await login(body.data);
        res.status(200).json({ success: "Logged in succesfully!", data: foundUser });
    } 
    catch (error) {
        console.error(error);
        res.status(500).json(getErrorMessage(error));
        return;
    }
});

router.post('/register', async (req, res) => {
    try {
        const body = registerSchema.safeParse(req.body);
        if (!body.success) 
            throw new FormatError(JSON.stringify(body.error.flatten()));
            
        await register(body.data);
        res.status(200).json({success: "User created successfully!"});
    }
    catch (error) {
        console.error(error);
        res.status(500).json(getErrorMessage(error));
        return;
    }
});

router.post('/send-reset-token', async (req, res) => {
    try {
        const body = resetRequestSchema.safeParse(req.body);

        if (!body.success) 
            throw new FormatError(JSON.stringify(body.error.flatten()))
        
        await sendToken(body.data.email);
        res.status(200).json({success: "Token sent to user email"})
    } 
    catch (error) {
        console.error(error);
        res.status(500).json(getErrorMessage(error));
        return;
    }

})

router.put('/reset-password', async (req, res) => {
    try {
        // console.log(req.body)
        const body = passwordResetSchema.safeParse(req.body);

        if (!body.success) 
            throw new FormatError(JSON.stringify(body.error.flatten()))

        const success = await changePassword(body.data);
        if (!success) throw new Error('Failed to change password');

        res.status(200).json({success: "Password changed successfully"})
    }
    catch (error) {
        console.error(error);
        res.status(500).json(getErrorMessage(error));
        return
    }
})

router.post('/check-reset-token', async (req, res) => {
    try {
        // console.log(req.body)
        const body = tokenCheckSchema.safeParse(req.body);

        if (!body.success) 
            throw new FormatError(JSON.stringify(body.error.flatten()))

        const success = await checkToken(body.data.token);

        if (!success) throw new Error('Invalid Token');

        res.status(200).json({success: "Valid Token"})
    }
    catch (error) {
        console.error(`${(error as Error).name}: ${(error as Error).message} `);
        res.status(500).json(getErrorMessage(error));
        return
    }
});