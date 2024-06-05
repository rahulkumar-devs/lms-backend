import { Response } from "express";
import { IUserSchema } from "../types/userTypes";
import config from "../configurations/config";
import sendResponse from "./sendResponse";
import redis from "../configurations/redis-connections";


interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

const sendToken = async (
    user: IUserSchema,
    res: Response
) => {
    try {

        const accessToken = await user.signAccessToken();
        const refreshToken = await user.signRefreshToken();


        redis.set(user._id as string, JSON.stringify(user));



        const accessTokenOptions: ITokenOptions = {
            expires: new Date(Date.now() + config.access_token_expiry * 1000),
            maxAge: config.access_token_expiry * 1000,
            httpOnly: true,
            sameSite: 'lax'
        }
        const refreshTokenOptions: ITokenOptions = {
            expires: new Date(Date.now() + config.refresh_token_expiry * 1000),
            maxAge: config.refresh_token_expiry * 1000,
            httpOnly: true,
            sameSite: 'lax'
        }

        if (config.node_env === "production") {
            accessTokenOptions.secure = true;
        }

        res.cookie("access-token", accessToken, accessTokenOptions).cookie("refresh-token", refreshToken, refreshTokenOptions).json({
            success: true,
            message: "Token attached",
            user,
            accessToken
        })



    } catch (error: any) {
        throw new Error(error)
    }
}

export default sendToken