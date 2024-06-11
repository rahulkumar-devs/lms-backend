import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import orderModel, { IOrder } from "../../models/order/order.model";
import userModel from "../../models/user/user.model";
import path from "path";
import courseModel, { ICourseData } from "../../models/course/course.model";
import ejs from "ejs";
import sendMail from "../../utils/sendMail";
import sendResponse from "../../utils/sendResponse";
import notificationModel from "../../models/notification/notification.model";


export const addOrder = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { courseId, payment_info } = req.body as IOrder;

            const user = await userModel.findById(req.user?._id);
            if (!user)
                return next(createHttpError(404, "user not found"));

            const userCourse: any = user.courses.find((item) => item?.courseId === courseId);

            if (!userCourse)
                return next(createHttpError(404, "Course not found"));


            const course = await courseModel.findById(courseId);

            const newOrder = {
                userId: req.user?._id,
                courseId
            }

            const order = await orderModel.create(newOrder);

            //   send mail to the user

            const orderPath = path.resolve(path.join(__dirname, "../../mails/orderDetails.ejs"));

            const orderDetails = {
                _id: user?._id,
                name: user.name,
                price: course?.price || null,
                date: new Date().toLocaleDateString("en-Us", { year: 'numeric', month: 'long', day: 'numeric' }),
                email: user.email,
                courseName: course?.name,

            }

            const orderFile = await ejs.renderFile(orderPath, orderDetails);
            if (!orderFile)
                return next(createHttpError(404, "failed to render"));

            try {
                await sendMail({ email: user.email, subject: "your course successfully orderd", template: orderFile })
            } catch (error: any) {
                next(createHttpError(400, error.message))
            }

            await notificationModel.create({
                title: "New Order",
                message: ` new Order from ${course?.name}`,
                userId: req?.user?._id,

            })

            course?.purchased ? course.purchased += 1 : course?.purchased;

            await course?.save()

            return sendResponse(res, 200, true, "Order successfully done", course)
        } catch (error: any) {
            next(createHttpError(500, error.message))
        }
    }
)