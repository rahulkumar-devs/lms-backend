
import { Response, Request, NextFunction } from "express";
import { IRegisterUser, IUserSchema, IActivationToken } from "../../types/userTypes";
import expressAsyncHandler from "express-async-handler"
import createHttpError from "http-errors";
import userModel from "../../models/user/user.model";
import jwt from "jsonwebtoken";
import config from "../../configurations/config"
import generateRandomNumber from "../../utils/randomNumbers";
import sendMail from "../../utils/sendMail";
import ejs from 'ejs';
import path from "path";
import sendResponse from "../../utils/sendResponse"

const registrationsUser = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body as IRegisterUser;

        const isEmpty = [name, email, password].some(field => !field);

        if (isEmpty) return next(createHttpError(400, " Invalid input field"));

        // check existing user
        const isEmailExist = await userModel.findOne({ email: email });
        if (isEmailExist) return next(createHttpError(400, "email Already exists"));

        const user: IRegisterUser = { name, email, password }

        const { activationCode, token } = createActivationToken(user);

        // send to mail

        const registerData = {
            user: {
                name: user.name, email: user.email,password:user.password
            },
            activationCode
        }

        const htmlFilePath = path.resolve(path.join(__dirname, "../../mails/register.ejs"))
        ejs.renderFile(htmlFilePath, registerData, async (err, html) => {
            if (err) {
                console.error("Error rendering EJS template:", err);
                return;
            }
            try {
                await sendMail(
                    {
                         email,
                        template:html,
                        subject: "Email varification ",
                    }
                )
            } catch (error: any) {
                next(createHttpError(500, error.message))
            }

        });

        sendResponse(res, 200, true, ` Code has been sent please Verify your account ${email} `, token)




    } catch (error: any) {
        next(createHttpError(500, error.message))
    }
})



export const createActivationToken = (user: IRegisterUser): IActivationToken => {

    const activationCode = generateRandomNumber(6).toString();
    const token = jwt.sign({ user, activationCode }, config.activate_token_key, { expiresIn: "5m" });

    return {
        activationCode, token
    }

}




export default registrationsUser;