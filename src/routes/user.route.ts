
import express from "express";
import registrationsUser from "../controllers/auth/registerUser";
import activateAccount from "../controllers/auth/activateAccount";
import { loginUser, logoutUser } from "../controllers/auth/loginUser";
import { isAuthenticated } from "../middleware/authentication";
import authorizedRole from "../middleware/authorizedRole";
import { updateAccessToken } from "../controllers/auth/updateAccessToken";
import { changeEmail, deleteUser, emailVerification, getUserById, updateUserInfo } from "../services/user.service";
import rolePermission, { socialAuth } from "../controllers/auth/rolePermission";
import { forgotPassword, verifyForgotPassword } from "../controllers/auth/forgotPassword";
import { upload } from "../middleware/multerUploadFiles";

const userRouter = express.Router();




// normal routes
userRouter.route("/register").post(registrationsUser);
userRouter.route("/activate-account").post(activateAccount);
userRouter.route("/login").post(loginUser);
userRouter.route("/refresh-token").get(updateAccessToken);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/password-verification").post(verifyForgotPassword);


// social Auth
userRouter.route("/social-auth").post(socialAuth);




// authenticated routes
userRouter.route("/logout").get(isAuthenticated, authorizedRole("admin"), logoutUser);
userRouter.route("/user").get(isAuthenticated, authorizedRole("admin", "user"), getUserById);
userRouter.route("/update-userinfo").put(isAuthenticated, authorizedRole("admin", "user"), upload.single("avatar"), updateUserInfo);
userRouter.route("/change-email").post(isAuthenticated, authorizedRole("admin", "user"), changeEmail);
userRouter.route("/email-verification").patch(isAuthenticated, authorizedRole("admin", "user"), emailVerification);
userRouter.route("delete-user").delete(isAuthenticated, authorizedRole("admin", "user"), deleteUser);
userRouter.route("/role-permission").put(isAuthenticated, authorizedRole("admin"), rolePermission);



// aditional features





export default userRouter;  