import express from "express";

import { findCourseById } from "../../model/myCourseModel.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const myCourseRouter = express.Router();

// Get the enrolled student courses by studentId | GET || Private
myCourseRouter.get("/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch courses by studentId
    const myCourses = await findCourseById(studentId);

    myCourses && myCourses.courses
      ? buildSuccessResponse(
          res,
          myCourses.courses,
          "Your courses fetched successfully"
        )
      : buildErrorResponse(res, "No courses found for this student.");
  } catch (error) {
    console.error("Error getting your courses:", error);
    buildErrorResponse(res, "Some error occurred while getting your courses.");
  }
});

export default myCourseRouter;
