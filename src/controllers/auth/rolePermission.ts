import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from 'http-errors';
import config from "../../configurations/config";
import userModel from "../../models/user/user.model";
import sendResponse from "../../utils/sendResponse";
import sendToken from "../../utils/jwt";


interface IRole {
    role: "admin" | "member" | "user"
}


const rolePermission = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { role } = req.body as IRole;

        if (!role) {
            return next(createHttpError(400, "Select a valid role"));
        }

        const isAdminEmail = req.user.email === config.admin_email;
        const currentUser = await userModel.findById(req.user._id);

        if (!currentUser) {
            return next(createHttpError(404, "Current user not found"));
        }

        const isAdmin = currentUser.roles.includes("admin");

        if (!isAdminEmail && !isAdmin) {
            return next(createHttpError(403, "Only an admin can update roles"));
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        if (user.roles.includes(role)) {
            return next(createHttpError(400, "User already has this role"));
        }

        user.roles.push(role);
        await user.save();

        sendResponse(res, 200, true, "Role updated successfully", user);
    } catch (error: any) {
        next(createHttpError(500, error.message));
    }
});


export default rolePermission;


export const removeRolePermission = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role) {
            return next(createHttpError(400, "Role is required"));
        }

        const isAdminEmail = req.user.email === config.admin_email;
        const currentUser = await userModel.findById(req.user._id);

        if (!currentUser) {
            return next(createHttpError(404, "Current user not found"));
        }

        const isAdmin = currentUser.roles.includes("admin");

        if (!isAdminEmail && !isAdmin) {
            return next(createHttpError(403, "Only admin can remove roles"));
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return next(createHttpError(404, "User not found"));
        }

        if (!user.roles.includes(role)) {
            return next(createHttpError(400, "Role not found for the user"));
        }

        user.roles = user.roles.filter((r) => r !== role);
        await user.save();

        res.status(200).json({ message: "Role removed successfully", user});
    } catch (error: any) {
        next(createHttpError(500, error.message));
    }
});








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

        // console.log( name, email, avatar )

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

        // return sendResponse(res, 200, true, " By social auth", null,{user})

    } catch (error: any) {
        return next(createHttpError(500, error.message))
    }
})

