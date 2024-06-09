
import { Request, Response, NextFunction } from "express"
import expressAsyncHandler from "express-async-handler"
import courseModel, { ICourse } from "../../models/course/course.model";
import uploadImageToCloudinary from "../../utils/cloudinaryImageUpload";
import createHttpError from "http-errors";
import sendResponse from "../../utils/sendResponse";
import { isValidObjectId } from "mongoose";
import redis from "../../configurations/redis-connections";
import { IUserSchema } from "../../types/userTypes";

// <===Without purchase===>

export const getSingleCourse = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        try {
            const { courseId } = req.params;

            if (!isValidObjectId(courseId)) {
                return next(createHttpError(404, "Course ID not found or invalid"));
            }

            const isChacheExists = await redis.get(courseId);
            if (isChacheExists) {
                const course = JSON.parse(isChacheExists);
                console.log("data from redis")
                return sendResponse(res, 200, true, "courses ", course)
            } else {
                const course = await courseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
                console.log("data from mongoose")
                redis.set(courseId, JSON.stringify(course))
                return sendResponse(res, 200, true, "courses ", course)
            }



        } catch (error: any) {
            return next(createHttpError(500, error.message));
        }


    })

// <===get all courses===>
// <===Without purchase===>


export const getAllCourses = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            const cacheKey = `allCourses?page=${page}&limit=${limit}`;
            const isCacheExists = await redis.get(cacheKey);

            if (isCacheExists) {
                const courses = JSON.parse(isCacheExists);
                console.log("Data from Redis");
                return sendResponse(res, 200, true, "Courses fetched successfully", courses,);
            } else {
                const courseData = await courseModel
                    .find()
                    .select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links")
                    .skip(skip)
                    .limit(limit);

                const totalCourses = await courseModel.countDocuments();
                const totalPages = Math.ceil(totalCourses / limit);

                const courses = {
                    courseData,
                    totalCourses,
                    totalPages,
                    currentPage: page,
                };

                // Set the cache to expire after a certain period, e.g., 1 hour (3600 seconds)
                await redis.set(cacheKey, JSON.stringify(courses), 'EX', 3600);

                return sendResponse(res, 200, true, "Courses fetched successfully", courses);
            }
        } catch (error: any) {
            return next(createHttpError(500, error.message));
        }
    }
);

export const getCourseForElibigleUser = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { courseId } = req.params;
            const user = req.user as IUserSchema;
            const courseLists = user.courses;

                const getUserCourses =  courseLists.find((item) => item.courseId.toString() === courseId.toString());
                if (!getUserCourses) {
                    return next(createHttpError(404, " you are not eligible for this course"));
                }
            

            const course = await courseModel.findById(courseId) || null;

            const coursesData = course?.courseData;

            return sendResponse(res, 200, true, "Courses fetched successfully", coursesData);

        } catch (error) {

        }

    })