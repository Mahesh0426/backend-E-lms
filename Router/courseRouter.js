import express from "express";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/reponseHelper.js";
import {
  createCourse,
  deleteCourse,
  deleteLecture,
  getCourse,
  getCourses,
  updateCourse,
} from "../model/courseModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const courseRouter = express.Router();

//get all courses | GET | public Route
courseRouter.get("/get/:id", authMiddleware, async (req, res) => {
  try {
    //get from auth middleware
    const instructorId = req.userInfo.id;

    // Fetch Courses
    const courses = await getCourses(instructorId);

    courses.length > 0
      ? buildSuccessResponse(res, courses, "Courses fetched successfully!!")
      : buildSuccessResponse(res, {}, "No courses found!!");
  } catch (error) {
    console.error("Error while fetching courses:", error);
    return buildErrorResponse(res, "Error while fetching courses!");
  }
});

//get a course details by ID | GET | Public Route
courseRouter.get("/:id", async (req, res) => {
  try {
    const course = await getCourse(req.params.id);

    course?._id
      ? buildSuccessResponse(res, course, "Course fetched successfully!!")
      : buildErrorResponse(res, "Course not found!!");
  } catch (error) {
    console.error("Error while fetching a course:", error);
    return buildErrorResponse(res, "Error while fetching  a course!", 500);
  }
});

// create a new course | POST | private Route
courseRouter.post("/create", async (req, res) => {
  try {
    const course = await createCourse(req.body);

    course?._id
      ? buildSuccessResponse(res, course, "Course saved successfully!!")
      : buildErrorResponse(res, " sorry!! Course not saved!!");
  } catch (error) {
    console.error("Error while adding course:", error);
    return buildErrorResponse(res, "Error while saving course!", 500);
  }
});

//delete a course | DELETE | private Route
courseRouter.delete("/delete/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    const deletedCourse = await deleteCourse(courseId);

    if (deletedCourse) {
      return buildSuccessResponse(
        res,
        deletedCourse,
        "Course deleted successfully!"
      );
    } else {
      return buildErrorResponse(res, "Course could not be deleted!");
    }
  } catch (error) {
    console.error("Error while deleting course:", error);
    return buildErrorResponse(res, "Error while deleting course!");
  }
});

// Update course details by ID | PUT | private Route
courseRouter.put("/update/:id", async (req, res) => {
  const courseId = req.params.id;
  const updatedCourse = req.body;

  try {
    const updatedCourseData = await updateCourse({
      ...updatedCourse,
      _id: courseId,
    });

    updatedCourseData?._id
      ? buildSuccessResponse(
          res,
          updatedCourseData,
          "Course updated successfully!!"
        )
      : buildErrorResponse(res, "Course could not update!!");
  } catch (error) {
    console.error("Error while updating course:", error);
    return buildErrorResponse(res, "Error while updating course!");
  }
});

//delete a lecture from course  | DELETE | PRIVATE route
courseRouter.delete("/delete/:courseId/:lectureId", async (req, res) => {
  const { courseId, lectureId } = req.params;

  try {
    const updatedCourse = await deleteLecture(courseId, lectureId);

    if (updatedCourse) {
      return buildSuccessResponse(
        res,
        updatedCourse,
        "Lecture deleted successfully!"
      );
    } else {
      return buildErrorResponse(res, "Course or lecture not found!");
    }
  } catch (error) {
    console.error("Error while deleting lecture:", error);
    return buildErrorResponse(res, "Error while deleting lecture!");
  }
});

export default courseRouter;
