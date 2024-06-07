

import { Response } from "express";
import { IUserSchema } from "../types/userTypes";
import config from "../configurations/config";
import redis from "../configurations/redis-connections";

export interface ITokenOptions {
    expires?: any;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}


// Cookie options
export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + config.access_token_expiry * 60 * 60 * 1000),
    maxAge: config.access_token_expiry * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: config.node_env === "production"
};


export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + config.refresh_token_expiry * 24 * 60 * 60 * 1000), // Calculate expiry time
    maxAge: config.refresh_token_expiry * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: config.node_env === "production"
};

const sendToken = async (
    user: IUserSchema,
    res: Response
) => {
    try {
        const accessToken = await user.signAccessToken();
        const refreshToken = await user.signRefreshToken();


        // Store user data in Redis
        await redis.set(user._id as string, JSON.stringify(user) as any);

        // Set cookies
        res.cookie("accessToken", accessToken, accessTokenOptions).cookie("refreshToken", refreshToken, refreshTokenOptions).status(200).json({
            success: true,
            message: "Token attached",
            user,
            accessToken
        });
    } catch (error: any) {
        throw new Error(error);
    }
};

export default sendToken;
