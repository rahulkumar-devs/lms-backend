import express from "express";
import { IUserSchema } from "../userTypes";

declare global {
  namespace Express {
    interface Request {
      user?: Record<IUserSchema>
    }
  }
}