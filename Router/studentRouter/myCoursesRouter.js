import express from "express";
import * as tf from "@tensorflow/tfjs-node";
import { findCourseById } from "../../model/myCourseModel.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
// import cosineSimilarity from "cosine-similarity";
import User from "../../Schema/userSchema.js";
import Course from "../../Schema/courseSchema.js";
import assignmentSubmissionSchema from "../../Schema/assessmentSchema/assignmentSubmissionSchema.js";
import quizSubmissionSchema from "../../Schema/quiz/quizSubmissionSchema.js";
import myCoursesSchema from "../../Schema/studentSchema/myCoursesSchema.js";

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

// // Function to vectorize attributes
// const vectorize = (user, course) => {
//   // Extract user and course features
//   const userFeatures = [
//     ...user.primaryInterests
//       .split(", ")
//       .map((interest) => interest.toLowerCase()),
//     user.skillLevel.toLowerCase(),
//     user.language.toLowerCase(),
//   ];

//   const courseFeatures = [
//     course.category.toLowerCase(),
//     course.level.toLowerCase(),
//     course.primaryLanguage.toLowerCase(),
//   ];

//   // Create a unified set of all unique attributes
//   const allAttributes = Array.from(
//     new Set([...userFeatures, ...courseFeatures])
//   );

//   // One-hot encode user and course features
//   const userEncoded = allAttributes.map((attr) =>
//     userFeatures.includes(attr) ? 1 : 0
//   );
//   const courseEncoded = allAttributes.map((attr) =>
//     courseFeatures.includes(attr) ? 1 : 0
//   );

//   // Normalize the vectors
//   const normalize = (vector) =>
//     Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));
//   const normalizedUser = userEncoded.map(
//     (value) => value / normalize(userEncoded)
//   );
//   const normalizedCourse = courseEncoded.map(
//     (value) => value / normalize(courseEncoded)
//   );

//   return { userEncoded: normalizedUser, courseEncoded: normalizedCourse };
// };
// // Recommendation system for student | GET
// myCourseRouter.get(
//   "/recommendations/:userId",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const userId = req.userInfo._id;

//       // Fetch user data
//       const user = await User.findById(userId);

//       // Adjusted Query for Filtering
//       const filteredCourses = await Course.find({
//         $and: [
//           {
//             $or: [
//               {
//                 title: {
//                   $regex: new RegExp(
//                     user.primaryInterests.split(", ").join("|"),
//                     "i"
//                   ),
//                 },
//               },
//               {
//                 category: {
//                   $regex: new RegExp(
//                     user.primaryInterests.split(", ").join("|"),
//                     "i"
//                   ),
//                 },
//               },
//             ],
//           },
//           { level: user.skillLevel.toLowerCase() },
//           { primaryLanguage: user.language.toLowerCase() },
//         ],
//       });

//       if (filteredCourses.length === 0) {
//         const fallbackCourses = await Course.find()
//           .sort({ "students.length": -1 })
//           .limit(5);
//         return res.status(200).json({
//           success: true,
//           recommendations: fallbackCourses,
//           message: "No exact match found. Showing trending courses instead.",
//         });
//       }

//       // Calculate similarity for each filtered course
//       const recommendations = filteredCourses.map((course) => {
//         const { userEncoded, courseEncoded } = vectorize(user, course);
//         const similarity = cosineSimilarity(userEncoded, courseEncoded);
//         return { course, similarity };
//       });

//       // Sort courses by similarity score
//       const sortedRecommendations = recommendations.sort(
//         (a, b) => b.similarity - a.similarity
//       );

//       res.status(200).json({
//         success: true,
//         recommendations: sortedRecommendations.map((rec) => rec.course),
//       });
//     } catch (error) {
//       console.error("Error fetching recommendations:", error);
//       res.status(500).json({ success: false, message: "Server error" });
//     }
//   }
// );

// Function to vectorize user and course features
const vectorizeData = (user, course) => {
  // Extract user features: primary interests, skill level, and language
  const userFeatures = [
    ...(user.primaryInterests
      ?.split(", ")
      .map((interest) => interest.toLowerCase()) || []),
    user.skillLevel?.toLowerCase() || "",
    user.language?.toLowerCase() || "",
  ];

  // Extract course features: category, level, and primary language
  const courseFeatures = [
    course.category.toLowerCase(),
    course.level.toLowerCase(),
    course.primaryLanguage.toLowerCase(),
  ];

  // Combine all unique attributes from both user and course into a unified set
  const allAttributes = Array.from(
    new Set([...userFeatures, ...courseFeatures])
  );

  // Create a vector for the user by marking 1 for matching attributes and 0 for non-matching
  const userVector = allAttributes.map((attr) =>
    userFeatures.includes(attr) ? 1 : 0
  );
  // Create a vector for the course using the same logic
  const courseVector = allAttributes.map((attr) =>
    courseFeatures.includes(attr) ? 1 : 0
  );

  return { userVector, courseVector };
};

// Function to calculate cosine similarity
const cosineSimilarity = (vectorA, vectorB) => {
  // Convert vectors to TensorFlow tensors
  const a = tf.tensor(vectorA);
  const b = tf.tensor(vectorB);

  // Calculate the dot product of the two vector
  const dotProduct = tf.sum(a.mul(b)).arraySync();

  // Calculate the magnitude (length) of each vector
  const magnitudeA = tf.sqrt(tf.sum(a.square())).arraySync();
  const magnitudeB = tf.sqrt(tf.sum(b.square())).arraySync();

  return dotProduct / (magnitudeA * magnitudeB);
};

// Recommendation System for Students | GET
myCourseRouter.get("/recommendations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1) Fetch user data
    const user = await User.findById(userId);

    // 2) Fetch the single MyCourses document for the user
    const myCoursesDoc = await myCoursesSchema.findOne({ userId });
    let enrolledCourseIds = [];

    // If a MyCourses document exists, extract the 'courseId' from each course
    if (myCoursesDoc && myCoursesDoc.courses) {
      enrolledCourseIds = myCoursesDoc.courses.map((c) => c.courseId);
    }

    // Scenario 1: if user hasn't set interests or skill level
    if (!user.primaryInterests || !user.skillLevel) {
      const mostEnrolledCourses = await Course.find({
        // Exclude courses already enrolled and return the most popular courses (most enrolled)
        _id: { $nin: enrolledCourseIds },
      })
        .sort({ "students.length": -1 })
        .limit(4);

      return res.status(200).json({
        success: true,
        recommendations: mostEnrolledCourses,
        message:
          "Showing most enrolled courses as no preferences were provided.",
      });
    }

    // Fetch quiz and assignment data
    const quizSubmissions = await quizSubmissionSchema.find({
      studentId: userId,
    });
    const assignmentSubmissions = await assignmentSubmissionSchema.find({
      studentId: userId,
    });

    // Scenario 2: Preferences but no quiz/assignment data
    if (quizSubmissions.length === 0 && assignmentSubmissions.length === 0) {
      // First, Find courses matching user's interests & skill level, excluding enrolled
      const filteredCourses = await Course.find({
        _id: { $nin: enrolledCourseIds }, // <-- Exclude enrolled
        $or: [
          {
            category: {
              $regex: new RegExp(
                user.primaryInterests
                  .split(", ")
                  .map((interest) =>
                    interest.replace(/\s+/g, "-").toLowerCase()
                  )
                  .join("|"),
                "i"
              ),
            },
          },
          {
            title: {
              $regex: new RegExp(
                user.primaryInterests
                  .split(", ")
                  .map((interest) => interest.toLowerCase())
                  .join("|"),
                "i"
              ),
            },
          },
        ],
        level: user.skillLevel.toLowerCase(),
      });

      // Second, Use vector similarity to rank these courses
      const recommendations = filteredCourses.map((course) => {
        // Convert user and course data to vectors
        const { userVector, courseVector } = vectorizeData(user, course);
        // Calculate similarity between vectors

        const similarity = cosineSimilarity(userVector, courseVector);
        return { course, similarity };
      });

      const sortedRecommendations = recommendations.sort(
        (a, b) => b.similarity - a.similarity
      );

      return res.status(200).json({
        success: true,
        recommendations: sortedRecommendations.map((rec) => rec.course),
        message:
          "Showing courses based on partial matches with your preferences.",
      });
    }

    // Scenario 3: Preferences with quiz/assignment data
    if (quizSubmissions.length > 0 || assignmentSubmissions.length > 0) {
      const quizScores = quizSubmissions.map((quiz) => quiz.obtainedMarks);
      const assignmentScores = assignmentSubmissions.map(
        (assignment) => assignment.score
      );

      const averageQuizScore =
        quizScores.length > 0
          ? quizScores.reduce((a, b) => a + b) / quizScores.length
          : 0;
      const averageAssignmentScore =
        assignmentScores.length > 0
          ? assignmentScores.reduce((a, b) => a + b) / assignmentScores.length
          : 0;

      // Determine performance threshold
      const performanceThreshold = 70;

      // Determine the category from the last quiz submission
      const topQuizSubmission = quizSubmissions[quizSubmissions.length - 1];
      let topCategory = null;
      if (topQuizSubmission) {
        const topCategoryCourse = await Course.findOne({
          _id: topQuizSubmission.courseId,
        });
        topCategory = topCategoryCourse?.category || null;
      }

      // Determine which levels to recommend based on performance
      const levelFilter =
        averageQuizScore >= performanceThreshold &&
        averageAssignmentScore >= performanceThreshold
          ? { $in: ["intermediate", "advanced"] }
          : { $in: ["beginner", "intermediate"] };

      // Build interests-based regex
      const interestsRegex = new RegExp(
        user.primaryInterests
          .split(", ")
          .map((interest) => interest.replace(/\s+/g, "-").toLowerCase())
          .join("|"),
        "i"
      );

      // Merge topCategory + user interests in an $or array
      const queryCriteria = [
        { category: interestsRegex },
        { title: interestsRegex },
      ];

      if (topCategory) {
        queryCriteria.push({ category: topCategory });
      }

      // Exclude enrolled courses, filter by query criteria and level
      let recommendedCourses = await Course.find({
        _id: { $nin: enrolledCourseIds }, // <-- Exclude enrolled
        $and: [
          {
            $or: queryCriteria,
          },
          {
            level: levelFilter,
          },
        ],
      }).sort({ "students.length": -1 });

      return res.status(200).json({
        success: true,
        recommendations: recommendedCourses,
        message:
          "Showing courses based on your quiz/assignment performance and your primary interests (excluding enrolled).",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default myCourseRouter;
