import express from "express";

import { findCourseById } from "../../model/myCourseModel.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
// import cosineSimilarity from "cosine-similarity";
import User from "../../Schema/userSchema.js";
import Course from "../../Schema/courseSchema.js";

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

// Function to vectorize attributes
const vectorize = (user, course) => {
  const userVector = [
    ...user.primaryInterests
      .split(", ")
      .map((interest) => interest.toLowerCase()),
    user.skillLevel.toLowerCase(),
    user.language.toLowerCase(),
  ];

  const courseVector = [
    course.category.toLowerCase(),
    course.level.toLowerCase(),
    course.primaryLanguage.toLowerCase(),
  ];

  // One-hot encode the combined vectors
  const allAttributes = [...new Set([...userVector, ...courseVector])];
  const userEncoded = allAttributes.map((attr) =>
    userVector.includes(attr) ? 1 : 0
  );
  const courseEncoded = allAttributes.map((attr) =>
    courseVector.includes(attr) ? 1 : 0
  );

  return { userEncoded, courseEncoded };
};

// Recommendation system for student | GET
myCourseRouter.get(
  "/recommendations/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.userInfo._id.toString();
      console.log("User ID:", userId);

      // Fetch user data
      const user = await User.findById(userId);
      console.log("User Preferences:", user);

      // Adjusted Query for Filtering
      const filteredCourses = await Course.find({
        $and: [
          {
            $or: [
              {
                title: {
                  $regex: new RegExp(
                    user.primaryInterests.split(", ").join("|"),
                    "i"
                  ),
                },
              },
              {
                category: {
                  $regex: new RegExp(
                    user.primaryInterests.split(", ").join("|"),
                    "i"
                  ),
                },
              },
            ],
          },
          { level: user.skillLevel.toLowerCase() },
          { primaryLanguage: user.language.toLowerCase() },
        ],
      });

      if (filteredCourses.length === 0) {
        const fallbackCourses = await Course.find()
          .sort({ "students.length": -1 })
          .limit(5);
        return res.status(200).json({
          success: true,
          recommendations: fallbackCourses,
          message: "No exact match found. Showing trending courses instead.",
        });
      }

      console.log("Filtered Courses:", filteredCourses);

      // Calculate similarity for each filtered course
      const recommendations = filteredCourses.map((course) => {
        const { userEncoded, courseEncoded } = vectorize(user, course);
        const similarity = cosineSimilarity(userEncoded, courseEncoded);
        return { course, similarity };
      });

      // Sort courses by similarity score
      const sortedRecommendations = recommendations.sort(
        (a, b) => b.similarity - a.similarity
      );

      res.status(200).json({
        success: true,
        recommendations: sortedRecommendations.map((rec) => rec.course),
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default myCourseRouter;
