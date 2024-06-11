import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import uploadImageToCloudinary, { deleteCloudinaryFile } from "../../utils/cloudinaryImageUpload";
import layoutModel from "../../models/layout/layout.modal";
import sendResponse from "../../utils/sendResponse";
import fs, { existsSync } from 'fs';
import { deleteFile } from "../../services/layout.service";

export const createLayout = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type, title, subTitle, faq, categories } = req.body;
            const imgPath = req.file?.path as string;

            if (!type) {
                return next(createHttpError(400, "Type is required"));
            }

            const isTypeExists = await layoutModel.find({ type });

            if (isTypeExists) {
                req.file?.path ? deleteFile(req.file?.path) : ""
                return next(createHttpError(400, ` type ${type} Already created`));
            }



            let layoutData: any = { type };

            if (type === "Banner") {
                if (!title || !subTitle || !imgPath) {
                    return next(createHttpError(400, "Title, subtitle, and image are required for Banner type"));
                }

                const result = await uploadImageToCloudinary({ filePath: imgPath, folder: "layout/images" });

                layoutData.banner = {
                    image: {
                        public_id: result.public_id,
                        url: result.url
                    },
                    title,
                    subtitle: subTitle
                };
            } else if (type === "FAQ") {
                if (!faq) {
                    return next(createHttpError(400, "FAQ data is required for FAQ type"));
                }

                layoutData.faq = faq;
            } else if (type === "Categories") {
                if (!categories) {
                    return next(createHttpError(400, "Categories data is required for Categories type"));
                }

                layoutData.categories = categories;
            } else {
                return next(createHttpError(400, "Invalid type specified"));
            }

            await layoutModel.create(layoutData);

            return sendResponse(res, 200, true, "Created successfully");
        } catch (error: any) {
            req.file?.path ? deleteFile(req.file?.path) : ""
            return next(createHttpError(500, error.message));
        }
    }
);


// const edit 

export const editLayout = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type, title, subTitle, faq, categories } = req.body;
            const imgPath = req.file?.path as string;

            if (!type) {
                req.file?.path ? deleteFile(req.file?.path) : ""
                return next(createHttpError(400, "Type is required"));
            }

            let layoutData: any = {};
            const layout = await layoutModel.findOne({ type });

            if (!layout) {
                req.file?.path ? deleteFile(req.file?.path) : ""
                return next(createHttpError(404, "Layout not found"));
            }

            if (type === "Banner") {
                if (!title || !subTitle) {
                    return next(createHttpError(400, "Title and subtitle are required for Banner type"));
                }

                if (imgPath) {
                    try {
                        await deleteCloudinaryFile(layout.banner.image.public_id);
                    } catch (error: any) {
                        return next(createHttpError(400, error.message));
                    }

                    const result = await uploadImageToCloudinary({ filePath: imgPath, folder: "layout/images" });

                    layoutData.banner = {
                        image: {
                            public_id: result.public_id,
                            url: result.url
                        },
                        title,
                        subtitle: subTitle
                    };
                } else {
                    layoutData.banner = {
                        ...layout.banner,
                        title,
                        subtitle: subTitle
                    };
                }
            } else if (type === "FAQ") {
                if (!faq) {
                    return next(createHttpError(400, "FAQ data is required for FAQ type"));
                }
                layoutData.faq = faq;
            } else if (type === "Categories") {
                if (!categories) {
                    return next(createHttpError(400, "Categories data is required for Categories type"));
                }
                layoutData.categories = categories;
            } else {
                return next(createHttpError(400, "Invalid type specified"));
            }

            await layoutModel.updateOne({ type }, { $set: layoutData });

            return sendResponse(res, 200, true, "Updated successfully");
        } catch (error: any) {
            req.file?.path ? deleteFile(req.file?.path) : ""
            return next(createHttpError(500, error.message));

        }
    }
);


export const getLayout =expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
try {
    
    const layout = await layoutModel.findOne({type:req.body.type});
    return sendResponse(res, 200, true, "get alyout successfully",layout);


} catch (error:any) {
    return next(createHttpError(500, error.message));
    
}
    })