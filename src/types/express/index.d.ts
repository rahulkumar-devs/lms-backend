import express from "express";
import { IUserSchema } from "../userTypes";
import { Multer } from 'multer';

declare global {
  namespace Express {
    interface Request {
      user?: Record<IUserSchema>;
      file?: Multer.File;
      files?: Multer.File[];
    }
  }
}