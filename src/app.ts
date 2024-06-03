
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan"
import cors from "cors";
// import config from "./configurations/config";
import config from "./configurations/config"
import createHttpError from "http-errors";


const app = express();


// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Enable CORS middleware
app.use(
    cors({
        origin: config.origin_url,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

// Cookie parsing middleware
app.use(cookieParser());


// Logging middleware
app.use(morgan("dev"));


// 404 Route
app.all("*", (req: Request, _, next: NextFunction) => {
    const err = createHttpError(404, `Route Not Found ${req.originalUrl}`);
    next(err);
});


export default app;