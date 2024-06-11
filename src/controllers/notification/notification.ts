import { Request, Response, NextFunction } from "express"
import expressAsyncHandler from "express-async-handler"
import createHttpError from "http-errors";
import sendResponse from "../../utils/sendResponse";
import notificationModel from "../../models/notification/notification.model";
import cron from "node-cron"

// get all notifications ----only for admin ---
export const getNotification = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const notification = await notificationModel.find().skip(skip).limit(limit).sort({ createdAt: -1 })

            return sendResponse(res, 200, true, "all notifications", notification)

        } catch (error: any) {
            next(createHttpError(500, error.message))
        }
    })


// update notification  ---only admin can do---
export const updateNotification = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        try {
            const { notificationId } = req.params;
            const notification = await notificationModel.findById(notificationId);
            if (!notification)
                return next(createHttpError(404, "notification not found"))
            else
                notification.status = "read"

            await notification.save();

            return sendResponse(res, 200, true, "updated notification", notification)

        } catch (error: any) {
            next(createHttpError(500, error.message))

        }
    })


// Delete notification after every one month


cron.schedule("0 0 0 * * *", async () => {

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await notificationModel.deleteMany({ status: "read", createdAt: { $lt: thirtyDaysAgo } })
})