import { NextFunction, Request, Response } from "express";
import createHttpError, { HttpError } from "http-errors";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    try {
        const status = err.status || 500;
        const message = err.message || "Internal Server Error";

        // Log the error details for debugging
        // console.error("Error:", {
        //     message: err.message,
        //     stack: err.stack,
        //     name: err.name,
        //     status: err.status,
        //     code: err.code,
        //     keyValue: err.keyValue
        // });

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

        if (err.code === 'LIMIT_FILE_SIZE') {
            const message = "Error: File size exceeds the limit of 10MB.";
            err = createHttpError(400, message); 
          }

        // Send the error response
        res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal Server Error",
            // Include stack trace in development mode
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    } catch (error) {
        // console.error("Error in error handler:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export default errorHandler;
