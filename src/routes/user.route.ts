
import express from "express";
import registrationsUser from "../controllers/auth/registerUser";
import activateAccount from "../controllers/auth/activateAccount";
import { loginUser, logoutUser } from "../controllers/auth/loginUser";
import { isAuthenticated } from "../middleware/authentication";
import authorizedRole from "../middleware/authorizedRole";
import { updateAccessToken } from "../controllers/auth/updateAccessToken";
import { changeEmail, emailVerification, getUserById, updateUserInfo } from "../services/user.service";

const userRouter = express.Router();




// normal routes
userRouter.route("/register").post(registrationsUser);
userRouter.route("/activate-account").post(activateAccount);
userRouter.route("/login").post(loginUser);
userRouter.route("/refresh-token").get(updateAccessToken);





// authenticated routes
userRouter.route("/logout").get(isAuthenticated, authorizedRole("admin", "user"), logoutUser);
userRouter.route("/user").get(isAuthenticated, authorizedRole("admin", "user"), getUserById);
userRouter.route("/update-userinfo").put(isAuthenticated, authorizedRole("admin", "user"), updateUserInfo);
userRouter.route("/change-email").post(isAuthenticated, authorizedRole("admin", "user"), changeEmail);
userRouter.route("/change-email").post(isAuthenticated, authorizedRole("admin", "user"), changeEmail);
userRouter.route("/email-verification").put(isAuthenticated, authorizedRole("admin", "user"), emailVerification);






export default userRouter;  