import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from 'express';
import createHttpError from "http-errors";
import { generateLast12MonthData } from "../../utils/analytics.generator";
import userModel from "../../models/user/user.model";
import sendResponse from "../../utils/sendResponse";
import courseModel from "../../models/course/course.model";
import orderModel from "../../models/order/order.model";



export const getUserAnalytics = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const user = await generateLast12MonthData(userModel);

            sendResponse(res,200,true,"get user analytics",user)

        } catch (error: any) {
            return next(createHttpError(500, error.message))
        }

    })
export const getCoursesAnalytics = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const user = await generateLast12MonthData(courseModel);

            sendResponse(res,200,true,"get user analytics",user)

        } catch (error: any) {
            return next(createHttpError(500, error.message))
        }

    })
export const getOrderAnalytics = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const user = await generateLast12MonthData(orderModel);

            sendResponse(res,200,true,"get user analytics",user)

        } catch (error: any) {
            return next(createHttpError(500, error.message))
        }

    })