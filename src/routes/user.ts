import { User } from "../models/user";
import express from 'express'
import { auth } from '../services/auth'
import { resetRequestSchema } from "../schemas/auth";
import { FormatError, getErrorMessage } from "../services/utils";

const router = express.Router();
export default router;

router.delete("/:username", auth ,async (req, res) => {
    try {
        const {username} = req.params;
        
        const foundUser = await User.findOne({ $and: [{ username }, {deleted: false}]});
        if (!foundUser) 
            throw new Error('User not found');

        foundUser.deleted = true;
        await foundUser.save();
        res.status(200).send({success: "User deleted successfully!"})
    }
    catch(error) {
        res.status(500).send(getErrorMessage(error))
    }
})

router.put('/:username/change-email', auth , async (req, res) => {
    try {
        const { username } = req.params;
        const body = resetRequestSchema.safeParse(req.body);
        
        if (!body.success) 
            throw new FormatError(JSON.stringify(body.error.flatten()));
        
        const foundUser = await User.findOne({ $and: [{ username }, {deleted: false}]});
        if (!foundUser) 
            throw new Error('User not found');

        foundUser.email = body.data.email;
        await foundUser.save();
        res.status(200).send({success: "Changed email successfully!"})
    }
    catch(error) {
        res.status(500).send(getErrorMessage(error))
    }
});

router.get('/:username', auth, async (req, res) => {
    try {
        const { username } = req.params;
        
        const foundUser = await User.findOne({ $and: [{ username }, {deleted: false}]});
        if (!foundUser) 
            throw new Error('User not found');

        res.status(200).send({data: {
            username: foundUser.username,
            email: foundUser.email
        }});
    }
    catch(error) {
        res.status(500).send(getErrorMessage(error))
    }
})