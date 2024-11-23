import { Types } from "mongoose";
import { User } from "../models/user";
import { RouteCallbackParams } from "../types/types";
import { Game } from "../models/game";
import { Schema } from "mongoose";
import { Review } from "../models/review";

export const changeUserEmail = async ({ params, body }: RouteCallbackParams) => {
    const { user_id } = params;
    const { email } = body;
    const foundUser = await User.exclusiveFindById(user_id);
    if (!foundUser) return;

    foundUser.email = email;
    await foundUser.save();
}

export const getUserData = async ({ params }: RouteCallbackParams) => {
    const { _id } = params;
    if (!_id)
        throw new Error("User id not provided");

    const $match = { $and: [{ _id: _id as Types.ObjectId }, { deleted: false }]};
    const $addFields = {
        favorites: { $size: "$favorites" },
        // reviews: {  }
    }
    const $lookup = {
        from: "reviews",
        localField: "_id",
        foreignField: "user",
        as: 'review'
    }

    console.log($match)

    // const foundUser = await User.findOne({ $and: [{_id}, { deleted: false }] })
    // .populate('comments')
    // .projection("username email user_type favorites level")
    // .exec()
    const foundUser = await User.findOne({ $and: [{ _id }, { deleted: false }] })
    .populate(['favorites'])
    .exec()

    if (!foundUser)
        throw new Error('User not found')
        // { $match },
    const reviews = await Review.find({ $and: [{user: _id}, {deleted: false}]})
        // { $addFields },
        // { $lookup }
    // ])
    // );
    console.log(foundUser)
    return {
        username: foundUser.username, 
        userLevel: foundUser.level, 
        profileImageUri: foundUser.profile_pic,
        email: foundUser.email,
        reviews: reviews.length, 
        favorites: foundUser.favorites.length 
    };
}

export const deleteUser = async ({ params }: RouteCallbackParams) => {
    const { _id } = params;
    const foundUser = await User.exclusiveFindById(_id);
    if (!foundUser) return;

    foundUser.deleted = true;
    await foundUser.save();
}

export const addFavorite = async ({ params, body }: RouteCallbackParams) => {
    const _id = params.user_id;
    if (!_id)
        throw new Error('Invalid user');

    const user = await User.findById(_id);
    if (!user) 
        throw new Error('Invalid user');

    const game = await Game.getByApiId(body.api_id)
    console.log({game})
    if (!game)
        throw new Error('Game not found');

    user.favorites = [...user.favorites, game._id as Schema.Types.ObjectId]
    await user.save()
}

export const removeFavorite = async ({ params, body }: RouteCallbackParams) => {
    const _id = params.user_id;
    if (!_id)
        throw new Error('Invalid user');

    const user = await User.findById(_id);
    if (!user) 
        throw new Error('Invalid user');

    console.log({body})
    const game = await Game.getByApiId(body.game_api_id)
    console.log({game})
    if (!game)
        throw new Error('Game not found');
    user.favorites = user.favorites.filter((g) => g !== game._id)
    await user.save()
}

export const setProfilePic = async ({ params, body }: RouteCallbackParams) => {
    const _id = params.user_id;
    const user = await User.findById(_id);
    if (!user) 
        throw new Error('Invalid user');

    user.profile_pic = body.url;
    await user.save();
}

export const getFavorites = async ({params}: RouteCallbackParams) => {
    const _id = params.user_id;
    const user = await User.findById(_id).populate(['favorites'])
    if (!user) 
        throw new Error('Invalid user');

    return user.favorites;
}