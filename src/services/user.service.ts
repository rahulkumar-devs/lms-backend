import expressAsyncHandler from "express-async-handler";
import { Response, Request, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import createHttpError from "http-errors";
import sendResponse from "../utils/sendResponse";
import jwt, { JwtPayload } from "jsonwebtoken"
import generateRandomNumber from "../utils/randomNumbers";
import config from "../configurations/config";
import { createActivationToken } from "../controllers/auth/registerUser";
import path from "path";
import sendMail from "../utils/sendMail";
import ejs from "ejs"
import { IUserSchema } from "../types/userTypes";
import { verifyToken } from "../utils/veifyToken";
import userModel from './../models/user/user.model';
import redis from "../configurations/redis-connections";
import uploadImageToCloudinary, { IFileDetails, checkFileExistsInCloudinary, deleteCloudinaryFile } from "../utils/cloudinaryImageUpload";
import fs from "fs";

// get one user / userById
// only authorized person can see 
export const getUserById = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        try {

            const userId = req.user?._id;


            const redisInfo = JSON.parse(await redis.get(userId) || "");
            if (redisInfo) {

                return sendResponse(res, 200, true, "User info", redisInfo)
            }

            if (!userId || !isValidObjectId(userId)) return next(createHttpError(400, "Not a valid Id"));
            const user = await userModel.findById({ _id: userId });
            if (!user) return next(createHttpError(404, "user not found"));
            sendResponse(res, 200, true, "User info", user)


        } catch (error) {
            next(error)
        }

    })

// update user

export const updateUserInfo = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body;
            const avatarPath = req.file?.path;
            const userId = req.user?._id;

            if (!userId || !isValidObjectId(userId)) {
                return next(createHttpError(400, "Invalid user ID"));
            }

            let avatarPic = {};

            if (avatarPath) {
                if (req.user.avatar.public_id) {
                    const isExistFile = await checkFileExistsInCloudinary(req.user.avatar.public_id)
                    console.log("isExistFile", isExistFile)
                    if (isExistFile) {
                        const isDelete = await deleteCloudinaryFile(req.user.avatar.public_id)
                        console.log("isDelete", isDelete)
                        avatarPic = await uploadImageToCloudinary({ filePath: avatarPath, folder: "avatar" })
                        console.log(avatarPic)
                    }
                }
                else {
                    avatarPic = await uploadImageToCloudinary({ filePath: avatarPath, folder: "avatar" })
                }
            }

            const user = await userModel.findByIdAndUpdate(userId, { name, avatar: avatarPic }, { new: true });
            // also change in redis
            await redis.set(userId as string, JSON.stringify(user))

            if (!user) {
                return next(createHttpError(404, "User not found"));
            }

            return sendResponse(res, 200, true, "Update successful", user);
        } catch (error) {

            if (fs.existsSync(req.file?.path as string)) {
                fs.unlinkSync(req.file?.path as string)
            }

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
            const user = JSON.parse(await redis.get(userId) || "")


            if (newEmail === user?.email) {
                return next(createHttpError(400, " Email already exist"));

            }
            // can't change original admin email
            if (newEmail === config.admin_email) {
                return next(createHttpError(400, " You have not permission to update this email"));
            }

            if (!user) {
                return next(createHttpError(404, "User not found"));
            }

            const newCode = generateRandomNumber(6);
            // console.log(newCode)

            const newData: IChangeEmail = {
                id: userId.toString(),
                email: newEmail,
                emailActivateCode: newCode
            };

            const token = jwt.sign(newData, config.jwt_email_verification_key, { expiresIn: "5m" });

            if (!token) {
                return next(createHttpError(400, "Token not generated"));
            }

            // Prepare mail details
            const mailDetails = {
                user: {
                    name: user.name,
                    email: user.email
                },
                emailChangeCode: newCode
            };

            const htmlFilePath = path.resolve(path.join(__dirname, "../mails/changeEmail.ejs"));

            ejs.renderFile(htmlFilePath, mailDetails, async (err, html) => {
                if (err) {
                    console.error("Error rendering EJS template:", err);
                    return next(createHttpError(500, "Error rendering email template"));
                }
                try {
                    await sendMail({
                        email: newEmail,
                        template: html,
                        subject: "Email change"
                    });
                } catch (error: any) {
                    console.error("Error sending email:", error);
                    return next(createHttpError(500, "Error sending email"));
                }
            });

            return sendResponse(res, 200, true, `Code sent to your email ${newEmail}. Please verify it.`, { emailToken: token });
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
                return next(createHttpError(400, "Email code and email token are required"));
            }

            let user: IChangeEmail | null = null;

            try {
                user = verifyToken(emailToken, config.jwt_email_verification_key) as IChangeEmail;
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

            const updatedUser = await userModel.findByIdAndUpdate(
                userId,
                { email: user.email },
                { new: true }
            ) as IUserSchema;

            // update redis

            await redis.set(userId as string, JSON.stringify(updatedUser))

            if (!updatedUser) {
                return next(createHttpError(400, "Unable to update email"));
            }

            return sendResponse(res, 200, true, "Email changed successfully", { user: updatedUser });
        } catch (error) {
            next(error);
        }
    }
);


// Only  Admin  can delete this
export const deleteUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { userId } = req.body;

            if (!userId) return next(createHttpError(400, "Email code and email token are required"));

            const isDelete = userModel.findByIdAndDelete({ _id: userId });
            // also del from redis
            await redis.del(userId as string)
            if (!isDelete) return next(createHttpError(400, "User not deleted"));

            return sendResponse(res, 200, true, "User deleted")
        } catch (error) {
            next(error);

        }
    })

