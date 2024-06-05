import { Response, Request, NextFunction } from "express";
import { IRegisterUser, IUserSchema } from "../../types/userTypes";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import userModel from "../../models/user/user.model";
import sendToken from "../../utils/jwt"; // Assuming sendToken is your token sending utility

const loginUser = expressAsyncHandler(
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
            sendToken(user, res);
        } catch (error: any) {
            next(error);
        }
    }
);

export default loginUser;
