import expressAsyncHandler from "express-async-handler";
import { Response, Request, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import createHttpError from "http-errors";
import sendResponse from "../utils/sendResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import generateRandomNumber from "../utils/randomNumbers";
import config from "../configurations/config";
import { createActivationToken } from "../controllers/auth/registerUser";
import path from "path";
import sendMail from "../utils/sendMail";
import ejs from "ejs";
import { IUserSchema } from "../types/userTypes";
import { verifyToken } from "../utils/veifyToken";
import userModel from "./../models/user/user.model";
import redis from "../configurations/redis-connections";
import uploadImageToCloudinary, {
    IFileDetails,
    checkFileExistsInCloudinary,
    deleteCloudinaryFile,
} from "../utils/cloudinaryImageUpload";
import fs from "fs";
import { deleteFile } from "./layout.service";
import deleteImageByUrl from "../utils/deleteImageByUrl";

// only authorized person can see
export const me = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;

            // const redisInfo = JSON.parse((await redis.get(userId)) || "");
            // if (redisInfo) {
            //     return sendResponse(res, 200, true, "User info", redisInfo);
            // }

            if (!userId || !isValidObjectId(userId))
                return next(createHttpError(400, "Not a valid Id"));
            const user = await userModel.findById({ _id: userId });
            if (!user) return next(createHttpError(404, "user not found"));
            return sendResponse(res, 200, true, "User info", null, { user });
        } catch (error: any) {
            return next(createHttpError(500, error.message));
        }
    }
);

// update user
export const updateUserInfo = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body;

            const userId = req.user?._id;

            // console.log(req.file?.path)

            if (!userId || !isValidObjectId(userId)) {
                deleteFile(req.file?.path as string)
                return next(createHttpError(400, "Invalid user ID"));
            }

            const user = await userModel.findById(userId);

            if (!user) {
                deleteFile(req.file?.path as string)
                return next(createHttpError(404, "User not found"));
            }

            let result = null;

            if (req.file) {
                // delete uploaded pic
                user.avatar && await deleteImageByUrl(user.avatar);
                // upload new Pic
                result = await uploadImageToCloudinary({ filePath: req.file.path, folder: "avatar" })
                console.log(result)

            }

            const updatedInfo = {
                name,
                avatar: result?.url
            }

            const newUser = await userModel.findOneAndUpdate(userId, updatedInfo, { new: true })

            if (!newUser) {
                deleteFile(req.file?.path as string)
                return next(createHttpError(404, "User not found"));
            }

            // also change in redis
            await redis.set(userId as string, JSON.stringify(newUser));


            return sendResponse(res, 200, true, "Update successful", user);
        } catch (error) {
            deleteFile(req.file?.path as string)
            next(error);
        }
    }
);

// change email;

interface IChangeEmail {
    id: string;
    email: string;
    emailActivateCode: number;
}

export const changeEmail = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            const newEmail = req.body.email;

            if (!userId || !isValidObjectId(userId)) {
                return next(createHttpError(400, "Invalid user ID"));
            }

            if (!newEmail || typeof newEmail !== "string") {
                return next(createHttpError(400, "Invalid email address"));
            }

            // get data from redis
            const user = JSON.parse((await redis.get(userId)) || "");

            if (newEmail === user?.email) {
                return next(createHttpError(400, " Email already exist"));
            }
            // can't change original admin email
            if (newEmail === config.admin_email) {
                return next(
                    createHttpError(400, " You have not permission to update this email")
                );
            }

            if (!user) {
                return next(createHttpError(404, "User not found"));
            }

            const newCode = generateRandomNumber(6);
            // console.log(newCode)

            const newData: IChangeEmail = {
                id: userId.toString(),
                email: newEmail,
                emailActivateCode: newCode,
            };

            const token = jwt.sign(newData, config.jwt_email_verification_key, {
                expiresIn: "5m",
            });

            if (!token) {
                return next(createHttpError(400, "Token not generated"));
            }

            // Prepare mail details
            const mailDetails = {
                user: {
                    name: user.name,
                    email: user.email,
                },
                emailChangeCode: newCode,
            };

            const htmlFilePath = path.resolve(
                path.join(__dirname, "../mails/changeEmail.ejs")
            );

            ejs.renderFile(htmlFilePath, mailDetails, async (err, html) => {
                if (err) {
                    console.error("Error rendering EJS template:", err);
                    return next(createHttpError(500, "Error rendering email template"));
                }
                try {
                    await sendMail({
                        email: newEmail,
                        template: html,
                        subject: "Email change",
                    });
                } catch (error: any) {
                    console.error("Error sending email:", error);
                    return next(createHttpError(500, "Error sending email"));
                }
            });

            return sendResponse(
                res,
                200,
                true,
                `Code sent to your email ${newEmail}. Please verify it.`,
                { emailToken: token }
            );
        } catch (error) {
            console.error("Error in changeEmail function:", error);
            return next(createHttpError(500, "Internal Server Error"));
        }
    }
);

// email verification

export const emailVerification = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { emailToken, emailCode } = req.body;

            if (!emailToken || !emailCode) {
                return next(
                    createHttpError(400, "Email code and email token are required")
                );
            }

            let user: IChangeEmail | null = null;

            try {
                user = verifyToken(
                    emailToken,
                    config.jwt_email_verification_key
                ) as IChangeEmail;
            } catch (error) {
                return next(createHttpError(400, "Invalid or expired email token"));
            }

            if (!user) {
                return next(createHttpError(400, "Email verification failed"));
            }

            const userId = user.id;

            if (!isValidObjectId(userId)) {
                return next(createHttpError(400, "Invalid user ID"));
            }

            const existingUser = await userModel.findOne({ email: user.email });
            if (existingUser) {
                return next(createHttpError(400, "Email is already taken"));
            }

            if (user.emailActivateCode !== emailCode) {
                return next(createHttpError(400, "Invalid email activation code"));
            }

            const updatedUser = (await userModel.findByIdAndUpdate(
                userId,
                { email: user.email },
                { new: true }
            )) as IUserSchema;

            // update redis

            await redis.set(userId as string, JSON.stringify(updatedUser));

            if (!updatedUser) {
                return next(createHttpError(400, "Unable to update email"));
            }

            return sendResponse(res, 200, true, "Email changed successfully", {
                user: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Only  Admin  can delete this
export const deleteUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;

            if (req.user?.email === config.admin_email)
                return next(createHttpError(400, "This Email could'nt delete"));

            if (!userId) return next(createHttpError(400, "Invalid user Id"));

            const isDelete = await userModel.findByIdAndDelete({ _id: userId });

            if (!isDelete) return next(createHttpError(400, "User not deleted"));
            // also del from redis
            await redis.del(userId as string);

            return sendResponse(res, 200, true, "User deleted");
        } catch (error: any) {
            next(createHttpError(500, error.message));
        }
    }
);

// for admin only

export const getAllUsers = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const users = await userModel
                .find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            return sendResponse(res, 200, true, "get all users", users);
        } catch (error: any) {
            return next(createHttpError(500, error.message));
        }
    }
);
