import express from "express"
import { uploadCourse } from "../controllers/course/course";
import { isAuthenticated } from './../middleware/authentication';
import authorizedRole from './../middleware/authorizedRole';
import { upload } from "../middleware/multerUploadFiles";
import { updateCourse } from "../controllers/course/updateCourse";
import { getAllCourses, getCourseForElibigleUser, getSingleCourse } from "../controllers/course/getCourses";
import { addAnswer, addQuestions, addReplyOnReview, addReview } from "../services/course.service";
const courseRoutes = express.Router();


// <====General Routes =====>
courseRoutes.route("/get-course/:courseId").get(getSingleCourse)
courseRoutes.route("/get-all-courses").get(getAllCourses)




// <==========================================>
// <==========Protected routes================>
// <==========================================>

courseRoutes.route("/upload-course").post(isAuthenticated, authorizedRole("admin"),
    upload.fields([{ name: 'courseThumbnail', maxCount: 1 }, { name: "videoThumbnail", maxCount: 1 }])
    ,
    uploadCourse)
courseRoutes.route("/update-course/:courseId").put(isAuthenticated, authorizedRole("admin"),
    upload.fields([{ name: 'courseThumbnail', maxCount: 1 }, { name: "videoThumbnail", maxCount: 1 }])
    ,
    updateCourse);

courseRoutes.route("/get-course-content/:courseId").get(isAuthenticated, authorizedRole("user", "admin", "member"), getCourseForElibigleUser)
courseRoutes.route("/add-question").put(isAuthenticated, addQuestions);
courseRoutes.route("/add-answer").put(isAuthenticated, addAnswer);
courseRoutes.route("/add-review/:courseId").put(isAuthenticated, addReview);
courseRoutes.route("/add-review-reply").put(isAuthenticated,addReplyOnReview)



export default courseRoutes;