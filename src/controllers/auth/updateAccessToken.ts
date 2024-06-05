import expressAsyncHandler from "express-async-handler";
import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../../configurations/config";
import redis from "../../configurations/redis-connections";
import createHttpError from "http-errors";
import sendToken, { accessTokenOptions, refreshTokenOptions } from "../../utils/jwt";

export const updateAccessToken = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const refreshToken = req.cookies.refreshToken;
        let decode_refreshToken;
        try {
            decode_refreshToken = jwt.verify(refreshToken, config.refresh_token_key) as JwtPayload
        } catch (error) {
            next(error)
        }
        const sessions = await redis.get(decode_refreshToken?._id as string);

        if (!sessions) return next(createHttpError("Could not refresh token"))

        const user = JSON.parse(sessions);

        const newAccessToken = jwt.sign({ _id: user?._id }, config.access_token_key, { expiresIn: "5m" });
        const newRefreshToken = jwt.sign({ _id: user?._id }, config.access_token_key, { expiresIn: "7d" });


        res.cookie("accessToken", newAccessToken, accessTokenOptions).cookie("refreshToken", newRefreshToken, refreshTokenOptions).status(200).json({
            success: true,
            message: "Token attached",
            user,
            accessToken: newAccessToken
        });
    } catch (error) {
        next(error)
    }
})

