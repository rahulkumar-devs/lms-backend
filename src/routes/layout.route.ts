import express from "express";
import { isAuthenticated } from "../middleware/authentication";
import authorizedRole from "../middleware/authorizedRole";
import { createLayout, editLayout, getLayout } from "../controllers/layout/layout";
import { upload } from "../middleware/multerUploadFiles";

const layoutRoute = express.Router();

layoutRoute.route("/create-layout").post(isAuthenticated,authorizedRole("admin"),upload.single("image"),createLayout)
layoutRoute.route("/update-layout").put(isAuthenticated,authorizedRole("admin"),upload.single("image"),editLayout)
layoutRoute.route("/get-layout").get(getLayout)

export default layoutRoute;