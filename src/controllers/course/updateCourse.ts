import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import courseModel, { ICourse } from "../../models/course/course.model";
import uploadImageToCloudinary from "../../utils/cloudinaryImageUpload";
import createHttpError from "http-errors";
import sendResponse from "../../utils/sendResponse";
import { isValidObjectId } from "mongoose";

export const updateCourse = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body as ICourse;
            const { courseId } = req.params;

            const courseThumbnail = req.file?.path;
            const videoThumbnail = req.files ? (req.files as any).videoThumbnail?.[0]?.path : null;

            if (!isValidObjectId(courseId)) {
                return next(createHttpError(404, "Course ID not found or invalid"));
            }

            if (!data) {
                return next(createHttpError(400, "Invalid data"));
            }

            let course = await courseModel.findById(courseId);

            if (!course) {
                return next(createHttpError(404, "Course not found"));
            }

            if (courseThumbnail) {
                const result = await uploadImageToCloudinary({ filePath: courseThumbnail, folder: "Course/thumbnail" });
                course.thumbnail = {
                    public_id: result.public_id,
                    url: result.url,
                };
            }

            if (videoThumbnail) {
                const result = await uploadImageToCloudinary({ filePath: videoThumbnail, folder: "Course/videos/thumbnail" });
                data.courseData.forEach((item) => {
                    item.videoThumbnail = {
                        public_id: result.public_id,
                        url: result.url,
                    };
                });
            }

            // Update course with new data
            course.name = data.name;
            course.descriptions = data.descriptions;
            course.price = data.price;
            course.estimatePrice = data.estimatePrice;
            course.tags = data.tags;
            course.level = data.level;
            course.demoUrl = data.demoUrl;
            course.benefits = data.benefits;
            course.prerequisites = data.prerequisites;
            course.reviews = data.reviews;
            course.courseData = data.courseData;
            course.ratings = data.ratings;
            course.purchased = data.purchased;

            await course.save();

            return sendResponse(res, 200, true, "Course updated successfully", course);
        } catch (error: any) {
            next(createHttpError(500, error.message));
        }
    }
);
