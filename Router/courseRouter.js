import express from "express";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/reponseHelper.js";
import {
  createCourse,
  getCourse,
  getCourses,
  updateCourse,
} from "../model/courseModel.js";

const courseRouter = express.Router();

//get all courses | GET | public Route
courseRouter.get("/get", async (req, res) => {
  try {
    // Fetch Courses
    const courses = await getCourses();

    courses.length > 0
      ? buildSuccessResponse(res, courses, "Courses fetched successfully!!")
      : buildSuccessResponse(res, {}, "No courses found!!");
  } catch (error) {
    console.error("Error while fetching courses:", error);
    return buildErrorResponse(res, "Error while fetching courses!", 500);
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
    console.error("Error while fetching course:", error);
    return buildErrorResponse(res, "Error while fetching course!", 500);
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

// Update course details by ID | PATCH | private Route
courseRouter.patch("/update/:id", async (req, res) => {
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

export default courseRouter;
