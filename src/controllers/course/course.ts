
import { Request, Response, NextFunction } from "express"
import expressAsyncHandler from "express-async-handler"
import courseModel, { ICourse } from "../../models/course/course.model";
import uploadImageToCloudinary from "../../utils/cloudinaryImageUpload";
import createHttpError from "http-errors";
import sendResponse from "../../utils/sendResponse";
import { isValidObjectId } from "mongoose";
import redis from "../../configurations/redis-connections";


//  req.files['avatar'][0] -> File
//  req.files['gallery'] -> Array
export const uploadCourse = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const data = req.body as ICourse;

            const thumbnailPath = req.file?.path;
            const courseThumbnail = req.files ? ["courseThumbnail"][0] : null;
            const videoThumbnail = req.files ? ["videoThumbnail"][0] : null;


            if (courseThumbnail && data) {
                // upload to cloudinary
                const result = await uploadImageToCloudinary({ filePath: courseThumbnail, folder: "Course/thumbnail" })
                data.thumbnail = {
                    public_id: result.public_id,
                    url: result.url
                }
            }
            if (videoThumbnail && data) {
                const result = await uploadImageToCloudinary({ filePath: videoThumbnail, folder: "Course/videos/thumbnail" })
                data.courseData.map((item) => {
                    item.videoThumbnail = {
                        public_id: result.public_id,
                        url: result.url
                    }
                })
            }



            // upload video
            const course = await courseModel.create(data);

            if (!course) {
                return next(createHttpError(400, "unable to create course"))
            }

            sendResponse(res, 200, true, "Course create successfully")

        } catch (error: any) {
            return next(createHttpError(500, error.message))
        }
    }
)

// <==Only admin can delete===>
export const deleteCourse = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { courseId } = req.params;

            if (! courseId || !isValidObjectId(courseId))
                return next(createHttpError(400, "Not a valid user Id"))


            const course = await courseModel.findByIdAndDelete(courseId);

            if (!course)
                return next(createHttpError(400, "course not deleted"))

            await redis.del(courseId)

            return sendResponse(res, 200, true, "Course deleted successfully")

        } catch (error: any) {
            return next(createHttpError(500, error.message))
        }

    })