import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../configurations/config";
import userModel from "../models/user/user.model";

export const isAuthenticated = expressAsyncHandler(
    async (req: Request, _, next: NextFunction) => {
        try {
            // Extract token from cookies or headers
            const accessToken = req.cookies?.accessToken;
            const tokenFromHeader = req.header("authorization")?.replace("Bearer", "").trim();

            console.log("Token from accessToken cookie:", accessToken);



            const token = accessToken || tokenFromHeader;

            if (!token) {
                console.error("Token not found");
                return next(createHttpError(401, "Token not found"));
            }

            // Verify JWT token
            let decode_token: JwtPayload;
            try {
                decode_token = jwt.verify(token, config.access_token_key) as JwtPayload;
            } catch (error: any) {
                return next(error);
            }

            if (!decode_token) {
                console.error("Failed to decode token");
                return next(createHttpError(401, "Unauthorized"));
            }

            // Extract user ID from token
            const { _id } = decode_token;
            if (!_id) {
                console.error("User ID not found in token");
                return next(createHttpError(401, "User not found"));
            }

            // Find user in database
            const user = await userModel.findById(_id);
            if (!user) {
                console.error("User not found in database");
                return next(createHttpError(401, "Unauthorized user"));
            }

            // Attach user to request object
            req.user = user;
            next();
        } catch (error) {
            console.error("Authentication error:", error);
            next(error);
        }
    }
);

