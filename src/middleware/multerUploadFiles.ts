import express, { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        const uploadDir = path.resolve(path.join(__dirname, "../../public/files"));
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|avi|mkv|mov|wmv|flv|webm|ogg/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    }

    if (file.size > 10 * 1024 * 1024) {
        return cb(new Error('Error: File upload only supports the following filetypes - ' + allowedTypes));
    }

    cb(new Error('Invalid image file'));
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB file size limit
});
