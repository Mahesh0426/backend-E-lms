import express from "express";

import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import { getCourse, getStudentCourses } from "../../model/courseModel.js";
import {
  buildFilters,
  buildSortParam,
} from "../../utility/filter&SortingHelper.js";
import { findCourseById } from "../../model/myCourseModel.js";
const studentCourseRouter = express.Router();

// get  all  student course |GET | Public Route
studentCourseRouter.get("/get", async (req, res) => {
  try {
    // Destructure query params with default values
    const {
      category = "",
      level = "",
      primaryLanguage = "",
      sortBy = "price-lowtohigh",
    } = req.query;

    // Build filters and sorting options using utility functions
    const filters = buildFilters(category, level, primaryLanguage);
    const sortParam = buildSortParam(sortBy);

    const courseList = await getStudentCourses({ filters, sortParam });

    buildSuccessResponse(res, courseList, "Courses fetched successfully");
  } catch (error) {
    console.error("Error fetching courses for student:", error.message);
    buildErrorResponse(res, "Error fetching courses for student");
  }
});

// //get a course student  details by id  | GET | public Route
studentCourseRouter.get("/:id", async (req, res) => {
  try {
    const courseDetails = await getCourse(req.params.id);

    courseDetails?._id
      ? buildSuccessResponse(
          res,
          courseDetails,
          "Course details fetched successfully"
        )
      : buildErrorResponse(res, "Course not found");
  } catch (error) {
    console.error("Error fetching course details for student:", error.message);
    buildErrorResponse(res, "Error fetching course details for student");
  }
});

// Check if the course is purchased by the student | GET
// studentCourseRouter.get("/purchase-info/:id/:studentId", async (req, res) => {
//   try {
//     const { id: courseId, studentId } = req.params;

//     // Fetch the student's courses
//     const studentCourses = await findCourseById(studentId);

//     // Check if the student has purchased the course
//     const isCoursePurchased = studentCourses?.courses.some(
//       (item) => item.courseId === courseId
//     );

//     if (isCoursePurchased) {
//       buildSuccessResponse(res, true, "Course has already been purchased!");
//     } else {
//       buildSuccessResponse(res, false, "Course has not been purchased yet.");
//     }
//   } catch (error) {
//     console.error("Error checking course purchase info:", error);
//     buildErrorResponse(
//       res,
//       "Some error occurred while checking course purchase info.",
//       500
//     );
//   }
// });

export default studentCourseRouter;
