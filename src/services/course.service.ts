import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import courseModel from '../models/course/course.model';
import path from 'path';
import ejs from "ejs";
import sendMail from '../utils/sendMail';
import sendResponse from '../utils/sendResponse';
import { IUserSchema } from '../types/userTypes';


export const addQuestions = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { question, contentId, courseId } = req.body as { question: string; contentId: string; courseId: string };

            if (!question || !contentId || !courseId) {
                return next(createHttpError(400, 'Invalid input fields'));
            }

            if (!isValidObjectId(contentId) || !isValidObjectId(courseId)) {
                return next(createHttpError(400, 'Invalid IDs'));
            }

            const course = await courseModel.findById(courseId);
            if (!course) {
                return next(createHttpError(404, 'Course not found'));
            }

            const courseContent = course.courseData.find((item) => String(item._id) === contentId);

            if (!courseContent) {
                return next(createHttpError(404, 'Content not found'));
            }



            courseContent.questions.push({ question, questionReplies: [], user: req?.user } as any)


            await course.save();

            return sendResponse(res, 200, true, "Add Question", course)

        } catch (error: any) {
            return next(createHttpError(500, error.message));
        }
    }
);

// <======Questions Answer========>
// <======>

interface IAddAnswer {
    courseId: string;
    contentId: string;
    answer: string;
    questionId: string;


}

export const addAnswer = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {


            const { courseId, contentId, answer, questionId } = req.body as IAddAnswer;

            if (!isValidObjectId(contentId) || !isValidObjectId(contentId) || !isValidObjectId(questionId))
                return next(createHttpError(400, ' Not a Valid ID '));

            const course = await courseModel.findById(courseId);

            const courseContent = course?.courseData.find((item) => String(item._id) === contentId);
            // console.log(courseContent)
            if (!courseContent) {
                return next(createHttpError(400, 'Invalid content id'));
            }

            const question = courseContent.questions.find((item) => String(item._id) === questionId);

            if (!question) {
                return next(createHttpError(400, 'Invalid question id'));
            }

            question.questionReplies.push({ answer: answer, user: req?.user } as any)


            await course?.save()


            // don't send notification mail to user if user reply to self

            if (String(req.user?._id) === String(question.user?._id)) {

                // attach notification 
                console.log("notification")
            } else {
                // send mail here 


                const data = {
                    name: question.user?.name || "",
                    title: courseContent.title,
                    dateAndTime: new Date(Date.now()),
                    replied: answer,


                }

                const htmlPath = path.resolve(path.join(__dirname, "../mails/notificationReply.ejs"));
                const notificationFile = await ejs.renderFile(htmlPath, data);

                try {

                    console.log(question.user?.email)
                    await sendMail({ email: question.user?.email, subject: " E-learning Question's reply ", template: notificationFile })

                } catch (error: any) {
                    next(createHttpError(500, error.message))
                }
            }

            return sendResponse(res, 200, true, "answer of asked question", course)

        } catch (error: any) {
            return next(createHttpError(500, error.message));

        }

    });

// <======Review======>

interface IReviewData {
    userId: string;
    review: string;
    rating: string;

}

export const addReview = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        try {

            const courseLists = req.user as IUserSchema;
            const { courseId } = req.params;

            // check is course exist , if exists then it can give reviews
            const isCourseExists = courseLists.courses.some((item) => item.courseId === courseId);
            if (!isCourseExists)
                return next(createHttpError(404, "you are not eligible to review"))

            const course = await courseModel.findById(courseId);

            if (!course)
                return next(createHttpError(404, "Course not found"))


            // destructure review obj
            const { review, rating } = req.body as IReviewData


            const newReview: any = {
                user: req.user,
                comment: review,
                rating,
            }
            course?.reviews.push(newReview)

            let avg = 0;

            course?.reviews.forEach((rev) => {
                avg += rev.rating;
            })

            if (course) {
                course.ratings = avg / course.reviews.length;
            }

            await course?.save()

            const notification = {
                title: "New review recived",
                message: ` ${req?.user?.name} has given a review ${course?.name}`
            }

            return sendResponse(res, 200, true, "add review", course)

        } catch (error: any) {
            return next(createHttpError(500, error.message));

        }
    })


// <=====(Replies on reviews)====>
// <====member and admin can reply =====>

interface IAddReviewReply {
    comment: string;
    courseId: string;
    reviewId: string;
}

export const addReplyOnReview = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        try {
            const { comment, courseId, reviewId } = req.body as IAddReviewReply
            const course = await courseModel.findById(courseId);

            if (!course)
                return next(createHttpError(404, "Course not found"))

            const reviews = course.reviews.find((item) => String(item._id) === reviewId.toString());

            if (!reviews)
                return next(createHttpError(404, "review Id not found"))

            const replyData: any = {
                user: req.user,
                comment
            }

            if(!reviews.commentReplies)
                reviews.commentReplies=[];

            reviews.commentReplies.push(replyData)


            await course.save()


            return sendResponse(res, 200, true, "add reply on review", course)

        } catch (error: any) {
            return next(createHttpError(500, error.message));

        }

    })