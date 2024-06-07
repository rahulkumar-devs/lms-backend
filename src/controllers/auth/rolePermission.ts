import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from 'http-errors';
import config from "../../configurations/config";
import userModel from "../../models/user/user.model";
import sendResponse from "../../utils/sendResponse";
import sendToken from "../../utils/jwt";

const rolePermission = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Ensure req.user is defined and has the necessary properties
        if (!req.user) {
            return next(createHttpError(401, "Unauthorized"));
        }

        const { email, roles } = req.user;

        // Check if the user is an admin
        if (email === config.admin_email && roles.includes("admin")) {
            const user = await userModel.findOne({ email });

            if (user) {
                // Add "admin" role if not already present
                if (!user.roles.includes("admin")) {
                    user.roles.push("admin");
                    await user.save();
                }

                // Send a success response
                return sendResponse(res, 200, true, "Role has been updated");
            } else {
                return next(createHttpError(404, "User not found"));
            }
        } else {
            return next(createHttpError(403, "Forbidden: You do not have the required permissions"));
        }
    } catch (error) {
        next(error); // Pass any errors to the error handler
    }
});

export default rolePermission;


// <============Social ===============>
// <==================Auth============>

interface ISocialAuthBody {
    name: string;
    email: string;
    avatar: string;
    // may be add more
}

export const socialAuth = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { name, email, avatar } = req.body as ISocialAuthBody;

        const user = await userModel.findOne({ email });

        if (!user) {
            let newUser: any;
            if (email === config.admin_email) {
                newUser = await userModel.create({ name, email, avatar, roles: ["admin"] });

            } else {
                newUser = await userModel.create({ name, email, avatar });

            };

            await sendToken(newUser, res)
        } else {
            await sendToken(user, res)

        }

    } catch (error) {
        next(error)
    }
})