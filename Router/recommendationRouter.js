import cosineSimilarity from "cosine-similarity";
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import User from "../Schema/userSchema.js";
import Course from "../Schema/courseSchema.js";

const recommendationRouter = express.Router();

// Function to vectorize attributes
const vectorize = (user, course) => {
  // Combine user preferences and course attributes
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

  // One-hot encode the combined vectors (example simplification)
  const allAttributes = [...new Set([...userVector, ...courseVector])];
  const userEncoded = allAttributes.map((attr) =>
    userVector.includes(attr) ? 1 : 0
  );
  const courseEncoded = allAttributes.map((attr) =>
    courseVector.includes(attr) ? 1 : 0
  );

  return { userEncoded, courseEncoded };
};

// Recommendation API
recommendationRouter.get(
  "/recommendations/:userId",
  authMiddleware,
  async (req, res) => {
    // Retrieved from JWT or session
    const userId = req.userInfo._id;

    const user = await User.findById(userId);
    const courses = await Course.find(); // Fetch all courses

    // Calculate similarity for each course
    const recommendations = courses.map((course) => {
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
  }
);

export default recommendationRouter;
