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

export default studentCourseRouter;
