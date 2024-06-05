import { Response, Request, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel from "../../models/user/user.model";
import sendToken from "../../utils/jwt"; // Assuming sendToken is your token sending utility
import redis from "../../configurations/redis-connections";
import { IUserSchema } from "../../types/userTypes";
import sendResponse from "../../utils/sendResponse";

export const loginUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password }: { email: string, password: string } = req.body;

            if (!email || !password) {
                return next(createHttpError(400, "Invalid credentials"));
            }

            const user = await userModel.findOne({ email }).select('+password');

            if (!user) {
                return next(createHttpError(400, "User does not exist"));
            }

            const isPasswordMatched = await user.comparePassword(password);

            if (!isPasswordMatched) {
                return next(createHttpError(400, "Password does not match"));
            }

            // login user
           await sendToken(user, res);
        } catch (error: any) {
            next(error);
        }
    }
);


export const logoutUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user as IUserSchema;
            if (!user) return next(createHttpError(400, "Not a Valid user or loged in"));
            try {
                await redis.del(user?._id as string);

            } catch (error) {
                next(error)

            }
            res.clearCookie("accessToken").clearCookie("refreshToken")
            sendResponse(res, 200, true, "cookie clear");
        } catch (error) {
            next(error)
        }

    })





