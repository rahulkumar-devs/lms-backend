import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    try {
        err.status = err.status || 500; // Change statusCode to status
        err.message = err.message || "Internal Server Error";

        console.log("Error:", err); // Log the error object to inspect its structure

        // Handle Mongoose cast errors (invalid ObjectId)
        if (err.name === "CastError") {
            const message = `Resource not found: ${err.path || 'Unknown path'}`;
            err = createHttpError(400, message);
        }

        // Handle Mongoose duplicate key errors
        if (err.code === 11000) {
            const keys = Object.keys(err.keyValue);
            const message = `Duplicate field value entered: ${keys.length > 0 ? keys.join(", ") : 'Unknown keys'}`;
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
        res.status(err.status).json({ // Change statusCode to status
            success: false,
            message: err.message,
        });
    } catch (error) {
        console.error("Error in error handler:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export default errorHandler;
