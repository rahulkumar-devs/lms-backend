import { NextFunction, Request, Response } from "express"
import createHttpError from "http-errors"


const authorizedRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(createHttpError(401, "User not authenticated"));
        }

        const userRoles = req.user.roles;
        console.log(userRoles)

        if (!Array.isArray(userRoles) || !userRoles.some(role => roles.includes(role))) {
            return next(createHttpError(403, `Roles: [${userRoles.join(", ")}] are not allowed to access this resource`));
        }

        next();
    }
}

export default authorizedRole