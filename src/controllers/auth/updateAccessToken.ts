import expressAsyncHandler from "express-async-handler";
import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../../configurations/config";
import redis from "../../configurations/redis-connections";
import createHttpError from "http-errors";
import { accessTokenOptions, refreshTokenOptions } from "../../utils/jwt";

export const updateAccessToken = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        // Verify refresh token
        let decodedRefreshToken: JwtPayload;
        try {
            decodedRefreshToken = jwt.verify(refreshToken, config.refresh_token_key) as JwtPayload;
        } catch (error) {
            return next(createHttpError(401, "Invalid refresh token"));
        }

        // Check if session exists in Redis
        const sessionId = decodedRefreshToken?._id as string;
        const sessionData = await redis.get(sessionId);
        if (!sessionData) {
            return next(createHttpError(400, "User session not found"));
        }

        // Parse user data from session
        const user = JSON.parse(sessionData);

        // Generate new tokens
        const newAccessToken = jwt.sign({ _id: user?._id }, config.access_token_key, { expiresIn: `${config.access_token_expiry}m` });
        const newRefreshToken = jwt.sign({ _id: user?._id }, config.refresh_token_key, { expiresIn: `${config.refresh_token_expiry}d` });

        // Set cookies with new tokens
        res.cookie("accessToken", newAccessToken, accessTokenOptions)
           .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
           .status(200).json({
               success: true,
               message: "Tokens updated successfully",
               accessToken: newAccessToken
           });

        // Update user session in Redis with new expiration time
        await redis.set(sessionId, JSON.stringify(user), "EX", config.refresh_token_expiry * 24 * 60 * 60);

    } catch (error) {
        next(error);
    }
});
