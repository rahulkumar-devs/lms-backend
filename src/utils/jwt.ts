import { Response } from "express";
import { IUserSchema } from "../types/userTypes";
import config from "../configurations/config";
import redis from "../configurations/redis-connections";

export interface ITokenOptions {
    expires?: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

export const getCookieOptions = (expirySeconds: number): ITokenOptions => ({
    expires: new Date(Date.now() + expirySeconds * 1000), // Set expiry in milliseconds
    maxAge: expirySeconds * 1000, // Max age in milliseconds
    httpOnly: true,
    sameSite: 'lax', // Adjust as per your security requirements
    secure: config.node_env === "production" // Use HTTPS in production
});

const sendToken = async (user: IUserSchema, res: Response) => {
    try {
        const accessToken = await user.signAccessToken();
        const refreshToken = await user.signRefreshToken();

        // Store user data in Redis (if needed)
        await redis.set(user._id as string, JSON.stringify(user));

        // Set expiry times based on config or constants
        const accessTokenOptions = getCookieOptions(config.access_token_expiry * 60); // Example: 60 minutes
        const refreshTokenOptions = getCookieOptions(config.refresh_token_expiry * 24 * 60 * 60); // Example: 24 hours

        // Set cookies with appropriate options
        res.cookie("accessToken", accessToken, accessTokenOptions)
           .cookie("refreshToken", refreshToken, refreshTokenOptions)
           .status(200)
           .json({
               success: true,
               message: "Successfully logged in",
               user,
               accessToken
           });
    } catch (error: any) {
        // console.error("Error in sendToken:", error);
        throw new Error(error);
    }
};

export default sendToken;
