import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import config from "./configurations/config";
import createHttpError from "http-errors";
import errorHandler from "./utils/errorHandler";
import userRouter from "../src/routes/user.route";
import courseRoutes from "./routes/course.route";

const app = express();
const apiVersion = 1;

// Enable CORS middleware
app.use(cors());

// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Cookie parsing middleware
app.use(cookieParser());

// Router middleware
app.use(`/api/v${apiVersion}`, userRouter);
app.use(`/api/v${apiVersion}`, courseRoutes);

// 404 Route
app.all("*", (req: Request, _, next: NextFunction) => {
    const err = createHttpError(404, `Route Not Found ${req.originalUrl}`);
    next(err);
});

// Error handling middleware
app.use(errorHandler);

export default app;
