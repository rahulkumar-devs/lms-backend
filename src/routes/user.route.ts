
import express from "express";
import registrationsUser from "../controllers/auth/registerUser";
import activateAccount from "../controllers/auth/activateAccount";
import { loginUser, logoutUser } from "../controllers/auth/loginUser";
import { isAuthenticated } from "../middleware/authentication";
import authorizedRole from "../middleware/authorizedRole";
import { updateAccessToken } from "../controllers/auth/updateAccessToken";
import { changeEmail, deleteUser, emailVerification, getAllUsers, me, updateUserInfo } from "../services/user.service";
import rolePermission, { removeRolePermission, socialAuth } from "../controllers/auth/rolePermission";
import { forgotPassword, updatePassword, verifyForgotPassword } from "../controllers/auth/forgotPassword";
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
userRouter.route("/me").get(updateAccessToken,isAuthenticated, me);
userRouter.route("/logout").post(isAuthenticated,  logoutUser);
userRouter.route("/update-userinfo").put(isAuthenticated, authorizedRole("admin", "user","member") ,upload.single("avatar"),updateUserInfo);
userRouter.route("/change-email").post(isAuthenticated, authorizedRole("admin","member", "user"), changeEmail);
userRouter.route("/email-verification").put(isAuthenticated, authorizedRole("admin", "user","member"), emailVerification);
userRouter.route("/update-password").put(isAuthenticated, authorizedRole("admin", "user","member"), updatePassword);

// <=====Only Admin Accessable=====>

userRouter.route("/delete-user/:userId").delete(isAuthenticated, authorizedRole("admin"), deleteUser);
userRouter.route("/role-permission/:userId").put(isAuthenticated, authorizedRole("admin"), rolePermission);
userRouter.route("/remove-role-permission/:userId").put(isAuthenticated, authorizedRole("admin"), removeRolePermission);
userRouter.route("/users").get(isAuthenticated, authorizedRole("admin"), getAllUsers);

// aditional features





export default userRouter;  