import expressAsyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import courseModel from '../models/course/course.model';


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



            courseContent.questions.push({ question, questionReplies: [], user: req?.user?._id } as any)


            await course.save();

            res.status(201).json({ message: 'Question added successfully' });
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
            console.log(courseContent)
            if (!courseContent) {
                return next(createHttpError(400, 'Invalid content id'));
            }

            const question = courseContent.questions.find((item) => String(item._id) === questionId);

            if (!question) {
                return next(createHttpError(400, 'Invalid question id'));
            }

            question.questionReplies.push({ answer: answer } as any)


            await course?.save()

            res.status(201).json({ message: 'Question added successfully' });

        } catch (error: any) {
            return next(createHttpError(500, error.message));

        }

    })