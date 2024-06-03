import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

export default (err: any, req: Request, res: Response, next: NextFunction) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    if (err.name === "CastError") {
        const message = `Resource not found ${err.path}`;
        err = createHttpError(400, message);
    }

    //  Duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} enterd`;
        err = createHttpError(400, message);

    }

    if (err.name === "jsonWebToken") {
        const message = `Invalid JsonWebToken`;
        err = createHttpError(400, message);
    }

    if (err.name === "TokenExpiredError") {
        const message = ` JsonWebToken expired`;
        err = createHttpError(400, message);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })



}