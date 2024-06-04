import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Handle Mongoose cast errors (invalid ObjectId)
    if (err.name === "CastError") {
        const message = `Resource not found: ${err.path}`;
        err = createHttpError(400, message);
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
        const message = `Duplicate field value entered: ${Object.keys(err.keyValue).join(", ")}`;
        err = createHttpError(400, message);
    }

    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = `Invalid JSON Web Token`;
        err = createHttpError(400, message);
    }

    // Handle JWT expired errors
    if (err.name === "TokenExpiredError") {
        const message = `JSON Web Token has expired`;
        err = createHttpError(400, message);
    }

    // Send the error response
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

export default errorHandler;
