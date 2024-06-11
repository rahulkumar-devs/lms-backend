
import express from "express";
import { isAuthenticated } from "../middleware/authentication";
import authorizedRole from "../middleware/authorizedRole";
import { getCoursesAnalytics, getOrderAnalytics, getUserAnalytics } from "../controllers/analytics/analytics";

const analyticsRoute = express.Router();
analyticsRoute.route("/get-users-analytics").get(isAuthenticated,authorizedRole("admin"),getUserAnalytics)
analyticsRoute.route("/get-courses-analytics").get(isAuthenticated,authorizedRole("admin"),getCoursesAnalytics)
analyticsRoute.route("/get-orders-analytics").get(isAuthenticated,authorizedRole("admin"),getOrderAnalytics)

export default analyticsRoute;