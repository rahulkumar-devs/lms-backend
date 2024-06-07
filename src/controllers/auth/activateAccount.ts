
import { Response, Request, NextFunction } from "express";
import { IRegisterUser } from "../../types/userTypes";
import expressAsyncHandler from "express-async-handler"
import createHttpError from "http-errors";
import userModel from "../../models/user/user.model";
import jwt from "jsonwebtoken";
import config from "../../configurations/config"
import sendResponse from "../../utils/sendResponse"


const activateAccount = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { activationToken, activateCode } = req.body;

            const { user, activationCode } = jwt.verify(activationToken, config.activate_token_key) as jwt.JwtPayload;

            if (activateCode !== activationCode) {
                next(createHttpError(400, "invalid activation code"))
            }

            const { name, email, password } = user as IRegisterUser;

            let roles: ("user" | "admin" | "member")[] = [];
            if (email === config.admin_email) {
                roles.push("admin");
            }

            const createUser = await userModel.create({ name, email, password, roles: roles })

            if (!createUser) return next(createHttpError(400, " user not register"))


            sendResponse(res, 200, true, "successFully user registerd", createUser)
        } catch (error: any) {

            next(error.message)
        }
    }
)

export default activateAccount;   