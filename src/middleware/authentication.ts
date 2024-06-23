import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../configurations/config";
import userModel from "../models/user/user.model";

export const isAuthenticated = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Extract token from cookies or headers
            const accessToken = req.cookies?.accessToken;
            const tokenFromHeader = req.header("authorization")?.replace("Bearer", "").trim();

            const token = accessToken || tokenFromHeader;
           

            // console.log(token)

            if (!token) {
                console.error("Token not found");
                return next(createHttpError(401, "Token not found"));
            }

            // Verify JWT token
            let decode_token: JwtPayload;
            try {
                decode_token = jwt.verify(token, config.access_token_key) as JwtPayload;
            } catch (error: any) {
                if (error.name === 'TokenExpiredError') {
                    
                    return next(createHttpError(401, 'Token is expired'));
                } else if (error.name === 'JsonWebTokenError') {
                   
                    return next(createHttpError(401, 'Invalid token'));
                } else {
                   
                    return next(createHttpError(400, "Token verification failed"));
                }
            }

            // Extract user ID from token
            const { _id } = decode_token;
            if (!_id) {
                console.error("User ID not found in token");
                return next(createHttpError(401, "User not found"));
            }

            // Find user in database
            const user = await userModel.findById(_id).select("-password");
            if (!user) {
                console.error("User not found in database");
                return next(createHttpError(401, "Unauthorized user"));
            }

            // Attach user to request object
            req.user = user;
            next();
        } catch (error) {
           console.error(error)
            next(createHttpError(500, "Internal Server Error"));
        }
    }
);
