import express from "express"
import { uploadCourse } from "../controllers/course/course";
import { isAuthenticated } from './../middleware/authentication';
import authorizedRole from './../middleware/authorizedRole';
import { upload } from "../middleware/multerUploadFiles";
import { updateCourse } from "../controllers/course/updateCourse";
import { getAllCourses, getAllCoursesForAdmin, getCourseForElibigleUser, getSingleCourse } from "../controllers/course/getCourses";
import { addAnswer, addQuestions, addReplyOnReview, addReview } from "../services/course.service";
import { updateAccessToken } from "../controllers/auth/updateAccessToken";
const courseRoutes = express.Router();


// <====General Routes =====>
courseRoutes.route("/get-course/:courseId").get(getSingleCourse)
courseRoutes.route("/get-all-courses").get(getAllCourses)




// <==========================================>
// <==========Protected routes================>
// <==========================================>

courseRoutes.route("/all-courses").put(isAuthenticated, authorizedRole("admin"), getAllCoursesForAdmin)


// Upload course
courseRoutes.route('/upload-course').post(
  updateAccessToken,
  isAuthenticated,
  authorizedRole("admin"),
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'demoVideo', maxCount: 1 },
    { name: 'courseVideo' }
  ]),
    uploadCourse
  );





// courseRoutes.route("/update-course/:courseId").put(isAuthenticated, authorizedRole("admin"),
//     upload.fields([{ name: 'courseThumbnail', maxCount: 1 }, { name: "videoThumbnail", maxCount: 1 }])
//     ,
//     updateCourse);


// courseRoutes.route("/delete-course/:courseId").delete(isAuthenticated, authorizedRole("admin"), deleteCourse)


//<=====****************====>
//<=====General  Routes====>
//<=====****************====>
courseRoutes.route("/get-course-content/:courseId").get(isAuthenticated, getCourseForElibigleUser)
courseRoutes.route("/add-question").put(isAuthenticated, authorizedRole("user", "member"), addQuestions);
courseRoutes.route("/add-answer").put(isAuthenticated, addAnswer);
courseRoutes.route("/add-review/:courseId").put(isAuthenticated, addReview);
courseRoutes.route("/add-review-reply").put(isAuthenticated, addReplyOnReview)




export default courseRoutes;