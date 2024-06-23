import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import courseModel, { ICourse, ICourseData, ILink } from "../../models/course/course.model";
import uploadToCloudinary from "../../utils/uploadToCloudinary";
import createHttpError from "http-errors";

export const uploadCourse = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const { name, description, price, estimatedPrice, tags, level } = req.body;
      const data = { name, description, price, estimatedPrice, tags, level };

      // Parse JSON strings back into arrays
      const prerequisites = JSON.parse(req.body?.prerequisites);
      const benefits = JSON.parse(req.body.benefits);
      const courseData: ICourseData[] = JSON.parse(req.body.courseContent);

      // Upload the thumbnail and demo video if they exist
      const courseThumbnailUrl = files?.thumbnail
        ? (await uploadToCloudinary({ filePath: files.thumbnail[0].path, folder: "courseThumbnail" })).url
        : null;
      const courseDemoVideoUrl = files?.demoVideo
        ? (await uploadToCloudinary({ filePath: files.demoVideo[0].path, folder: "courseDemo" })).url
        : null;

      // Upload course videos and update courseData with their URLs
      if (courseData && courseData.length > 0 && files?.courseVideo && files.courseVideo.length > 0) {
        const uploadPromises = files.courseVideo.map(file => uploadToCloudinary({ filePath: file.path, folder: "courseVideos" }));
        const videoUrls = await Promise.all(uploadPromises);

        courseData.forEach((item, index) => {
          item.contentVideo = videoUrls[index].url || ""; // Assuming the order of files and courseData is the same
          item.descriptions = item.descriptions || 'Default description';
          item.suggestion = item.suggestion || 'Default suggestion';
          if (item.links && item.links.length > 0) {
            item.links.forEach((link: ILink) => {
              link.title = link.title || "Default title";
              link.url = link.url || "Default URL";
            });
          }
        });
      }

      // Create a new course object
      const newCourse: ICourse = new courseModel({
        ...data,
        prerequisites,
        benefits,
        courseData,
        thumbnail: courseThumbnailUrl,
        demoVideo: courseDemoVideoUrl,
        descriptions: req.body.descriptions || 'Default course description',
        suggestion: req.body.suggestion || 'Default course suggestion',
      });

      // Save the new course to the database
      const savedCourse = await newCourse.save();

      res.status(200).json({
        success: true,
        message: 'Course created successfully',
        data: savedCourse,
      });
    } catch (error: any) {
      console.error('Error creating course:', error);
      return next(createHttpError(500, error.message));
    }
  }
);
