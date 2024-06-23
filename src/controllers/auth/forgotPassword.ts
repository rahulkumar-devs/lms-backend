import expressAsyncHandler from "express-async-handler";
import { Response, Request, NextFunction } from "express";
import userModel from "../../models/user/user.model";
import ejs from "ejs";
import path from "path";
import jwt from "jsonwebtoken";
import generateRandomNumber from "../../utils/randomNumbers";
import sendMail from "../../utils/sendMail";
import createHttpError from "http-errors";
import config from "../../configurations/config";
import sendResponse from "../../utils/sendResponse";
import redis from "../../configurations/redis-connections";



// <============= forgotPassword , ==============>
// <=============================================>

export const forgotPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        // Generate random forgot code
        const forgotCode = generateRandomNumber(6).toString();

        // Generate JWT token with user info
        const forgotpassToken = jwt.sign({ name: user.name, email: user.email, forgotCode }, config.jwt_email_verification_key);

        // Render HTML template
        const htmlFilePath = path.resolve(path.join(__dirname, "../../mails/forgotPassword.ejs"));
        const html = await ejs.renderFile(htmlFilePath, { name: user.name, email: user.email, forgotCode });

        // Send email
        await sendMail({
            email: user.email,
            template: html,
            subject: "Email varification",
        });

        sendResponse(res, 200, true, `  code send to your mail ${email}`, forgotpassToken)
    } catch (error: any) {
        // Handle errors
        next(createHttpError(500, error.message));
    }
});


// 
export const verifyForgotPassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, resetCode, newPassword } = req.body as { token: string; resetCode: string; newPassword: string };

        if (!token || !resetCode || !newPassword) return next(createHttpError(400, "all inputs required"));

        // Decode the JWT token
        const decodedToken = jwt.verify(token, config.jwt_email_verification_key) as { email: string, forgotCode: string } | null;

        if (!decodedToken) {
            return next(createHttpError(400, "Invalid token"));
        }

        // Extract email and reset code from the decoded token
        const { email, forgotCode: decodedResetCode } = decodedToken;

        // Find user by email
        const user = await userModel.findOne({ email });


        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        // update redis
        await redis.set(user?._id as string, JSON.stringify(user))

        // Check if the provided reset code matches the decoded reset code
        if (decodedResetCode !== resetCode) {
            return next(createHttpError(400, "Invalid reset code"));
        }

        // change password 

        user.password = newPassword
        await user.save();

        // Respond with success message
        res.status(200).json({ success: true, message: "Password reset code verified successfully" });
    } catch (error: any) {
        // Handle errors
        next(createHttpError(500, error.message));
    }
});


export const updatePassword = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id;
        const { oldPassword, newPassword } = req.body;



        // Ensure that the password field is selected
        const user = await userModel.findOne({_id:userId}).select("+password");
      

        if(! user?.password)
            return next(createHttpError(404, "You have authenticated by social auth"));


        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        const isPasswordMatched = await user.comparePassword(oldPassword as string);
        if (!isPasswordMatched) {
            return next(createHttpError(400, "Wrong Password"));
        }

        user.password = newPassword;
        await user.save();

        sendResponse(res, 200, true, "Password changed successfully");
    } catch (error: any) {
        console.error(error);
        next(createHttpError(500, error.message));
    }
});