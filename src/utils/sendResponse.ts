import { Response } from "express";

interface ApiResponse {
    success: boolean;
    message: string;
    [key: string]: any;  // Allow additional properties
}

const sendResponse = (res: Response, statusCode: number, success: boolean, message: string, data?: any, extra?: { [key: string]: any }): void => {
    const response: ApiResponse = {
        success,
        message,
        data,
        ...extra  // Spread additional properties
    };

    res.status(statusCode).json(response);
};

export default sendResponse;


// Respond with success and include extra data if needed
// sendResponse(res, 201, true, "User registered successfully", { name, email }, { registeredAt: new Date().toISOString() });