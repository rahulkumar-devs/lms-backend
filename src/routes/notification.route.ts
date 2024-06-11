import express from "express"
import { isAuthenticated } from "../middleware/authentication";
import { getNotification, updateNotification } from "../controllers/notification/notification";
import authorizedRole from "../middleware/authorizedRole";

const notificationRoute = express.Router();


notificationRoute.route("/notifications").get(isAuthenticated, authorizedRole("admin"), getNotification);
notificationRoute.route("/notifications/:notificationId").put(isAuthenticated, authorizedRole("admin"), updateNotification);



export default notificationRoute;