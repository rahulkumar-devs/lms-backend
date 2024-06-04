
import express from "express";
import registrationsUser from "../controllers/auth/registerUser";
import activateAccount from "../controllers/auth/activateAccount";

const userRouter = express.Router();


userRouter.route("/register").post(registrationsUser);
userRouter.route("/activate-account").post(activateAccount);

export default userRouter;