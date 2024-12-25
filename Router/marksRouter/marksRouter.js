import express from "express";
import Course from "../../Schema/courseSchema.js";
import AssignmentSubmission from "../../Schema/assessmentSchema/assignmentSubmissionSchema.js";
import QuizSubmission from "../../Schema/quiz/quizSubmissionSchema.js";
import CourseProgress from "../../Schema/studentSchema/courseProgressSchema.js";
import MyCourses from "../../Schema/studentSchema/myCoursesSchema.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";

const marksRouter = express.Router();

// get marks for students using instructor id | GET | private Route
marksRouter.get("/get-all-marks/instructor/:instructorId", async (req, res) => {
  const { instructorId } = req.params;

  try {
    // Step 1: Fetch courses taught by the instructor
    const courses = await Course.find({ instructorId });
    const courseIds = courses.map((course) => course._id);

    // Step 2: Fetch assignment submissions for these courses
    const assignmentSubmissions = await AssignmentSubmission.find({
      courseId: { $in: courseIds },
    })
      .populate("studentId", "userName userEmail")
      .populate("courseId", "title");

    // Step 3: Fetch quiz submissions for these courses
    const quizSubmissions = await QuizSubmission.find({
      courseId: { $in: courseIds },
    })
      .populate("studentId", "userName userEmail")
      .populate("courseId", "title");

    // Step 4: Process and combine data
    const result = {
      assignments: assignmentSubmissions.map((submission) => ({
        studentName: submission.studentId.userName,
        studentEmail: submission.studentId.userEmail,
        courseTitle: submission.courseId.title,
        score: submission.score || 0,
        maxScore: submission.maxScore,
      })),
      quizzes: quizSubmissions.map((submission) => ({
        studentName: submission.studentId.userName,
        studentEmail: submission.studentId.userEmail,
        courseTitle: submission.courseId.title,
        obtainedMarks: submission.obtainedMarks || 0,
        totalMarks: submission.totalMarks || 0,
      })),
    };

    // Step 5: Send the response

    buildSuccessResponse(res, result, "marks fetches successfully!!");
  } catch (error) {
    console.error("Error fetching marks:", error);
    buildErrorResponse(res, "Failed to fetch marks");
  }
});

// Get marks for a particular student using studentId and courseId | GET | private Route
marksRouter.get("/get-marks/student/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    // Step 1: Fetch courses taught by the instructor
    const courses = await Course.find({ "students.studentId": studentId });

    const courseIds = courses.map((course) => course._id);

    // Step 2: Fetch assignment submissions for these courses
    const assignmentSubmissions = await AssignmentSubmission.find({
      courseId: { $in: courseIds },
      studentId: studentId,
    })
      .populate("studentId", "userName userEmail")
      .populate("courseId", "title");

    // Step 3: Fetch quiz submissions for these courses
    const quizSubmissions = await QuizSubmission.find({
      courseId: { $in: courseIds },
      studentId: studentId,
    })
      .populate("studentId", "userName userEmail")
      .populate("courseId", "title");

    // Step 4: Process and combine data
    const result = {
      assignments: assignmentSubmissions.map((submission) => ({
        studentName: submission.studentId.userName,
        studentEmail: submission.studentId.userEmail,
        courseTitle: submission.courseId.title,
        score: submission.score || 0,
        maxScore: submission.maxScore,
      })),
      quizzes: quizSubmissions.map((submission) => ({
        studentName: submission.studentId.userName,
        studentEmail: submission.studentId.userEmail,
        courseTitle: submission.courseId.title,
        obtainedMarks: submission.obtainedMarks || 0,
        totalMarks: submission.totalMarks || 0,
      })),
    };

    // Step 5: Send the response

    buildSuccessResponse(res, result, "marks fetches successfully!!");
  } catch (error) {
    console.error("Error fetching marks:", error);
    buildErrorResponse(res, "Failed to fetch marks");
  }
});

// GET average scores of all courses taught by a particular instructor
// marksRouter.get("/get-course-averages/:instructorId", async (req, res) => {
//   const { instructorId } = req.params;

//   try {
//     // 1. Fetch all courses for this instructor
//     const courses = await Course.find({ instructorId });
//     const results = [];

//     // 2. For each course, calculate average assignment & quiz scores
//     for (const course of courses) {
//       // Fetch assignment submissions
//       const assignmentSubmissions = await AssignmentSubmission.find({
//         courseId: course._id,
//       });

//       // Fetch quiz submissions
//       const quizSubmissions = await QuizSubmission.find({
//         courseId: course._id,
//       });

//       // Calculate assignment average
//       const assignmentScores = assignmentSubmissions.map(
//         (submission) => submission.score || 0
//       );
//       const assignmentAvg =
//         assignmentScores.length > 0
//           ? assignmentScores.reduce((acc, score) => acc + score, 0) /
//             assignmentScores.length
//           : 0;

//       // Calculate quiz average
//       const quizScores = quizSubmissions.map(
//         (submission) => submission.obtainedMarks || 0
//       );
//       const quizAvg =
//         quizScores.length > 0
//           ? quizScores.reduce((acc, score) => acc + score, 0) /
//             quizScores.length
//           : 0;

//       // 3. Fetch course progress data (from your CourseProgress schema)
//       const courseProgressData = await CourseProgress.find({
//         courseId: course._id,
//       });

//       // Count how many students have completed vs. not completed
//       let completedCount = 0;
//       let inProgress = 0;

//       courseProgressData.forEach((progress) => {
//         if (progress.completed) {
//           completedCount++;
//         } else {
//           inProgress++;
//         }
//       });

//       // 4. Push the result for this course
//       const courseResult = {
//         courseId: course._id,
//         courseTitle: course.title,
//         assignmentAverage: assignmentAvg,
//         quizAverage: quizAvg,
//         courseProgress: {
//           completed: completedCount,
//           inProgress: inProgress,
//         },
//       };
//       results.push(courseResult);
//     }

//     // 5. Return the aggregated data for analytics
//     buildSuccessResponse(
//       res,
//       results,
//       "Course averages and course progress  fetched successfully!"
//     );
//   } catch (error) {
//     console.error("Error fetching course averages:", error);
//     buildErrorResponse(res, "Failed to fetch course averages");
//   }
// });

marksRouter.get(
  "/get-course-stats/instructor/:instructorId",
  async (req, res) => {
    const { instructorId } = req.params;

    try {
      // 1. Find all courses for this instructor
      const courses = await Course.find({ instructorId });
      const results = []; // will store stats for each course

      // 2. Loop through each course
      for (const course of courses) {
        const courseId = course._id.toString();

        // 2a. Assignment & Quiz averages (same as before)
        const assignmentSubmissions = await AssignmentSubmission.find({
          courseId,
        });
        const quizSubmissions = await QuizSubmission.find({ courseId });

        const assignmentScores = assignmentSubmissions.map((s) => s.score || 0);
        const quizScores = quizSubmissions.map((s) => s.obtainedMarks || 0);

        const assignmentAvg =
          assignmentScores.length > 0
            ? assignmentScores.reduce((acc, cur) => acc + cur, 0) /
              assignmentScores.length
            : 0;

        const quizAvg =
          quizScores.length > 0
            ? quizScores.reduce((acc, cur) => acc + cur, 0) / quizScores.length
            : 0;

        // 2b. Find all userIds who have this course in their MyCourses array
        //     The key is "courses.courseId": courseId
        const allMyCoursesDocs = await MyCourses.find({
          "courses.courseId": courseId,
        });

        // We'll flatten the results to get a unique list of userIds
        // who are enrolled in this course.
        const enrolledUserIds = [];
        allMyCoursesDocs.forEach((doc) => {
          // doc.courses may contain multiple courses
          doc.courses.forEach((c) => {
            if (c.courseId === courseId) {
              enrolledUserIds.push(doc.userId);
            }
          });
        });

        // Make them unique (just in case duplicates appear)
        const uniqueUserIds = [...new Set(enrolledUserIds)];
        const totalEnrolled = uniqueUserIds.length;

        // 2c. Check CourseProgress to see if they started/completed
        const progressDocs = await CourseProgress.find({
          courseId: courseId,
          userId: { $in: uniqueUserIds },
        });

        // Build a map of userId => progress doc
        const progressMap = {};
        progressDocs.forEach((p) => {
          progressMap[p.userId] = p;
        });

        let completedCount = 0;
        let notStartedCount = 0;
        let inProgressCount = 0;

        uniqueUserIds.forEach((userId) => {
          const userProgress = progressMap[userId];

          // If no doc, definitely not started
          if (!userProgress) {
            notStartedCount++;
            return;
          }

          // If doc exists and completed is true => completed
          if (userProgress.completed) {
            completedCount++;
            return;
          }

          // Otherwise, doc exists but not completed => check lecturesProgress
          if (
            !userProgress.lecturesProgress ||
            userProgress.lecturesProgress.length === 0
          ) {
            // no lectures actually viewed => not started
            notStartedCount++;
          } else {
            // some progress => in progress
            inProgressCount++;
          }
        });

        // 2d. Build final stats for this course
        results.push({
          courseId: courseId,
          courseTitle: course.title,
          assignmentAverage: assignmentAvg,
          quizAverage: quizAvg,
          totalEnrolled,
          progressStats: {
            notStarted: notStartedCount,
            inProgress: inProgressCount,
            completed: completedCount,
          },
        });
      }

      // 3. Return the results array
      buildSuccessResponse(res, results, "Course stats fetched successfully!");
    } catch (error) {
      console.error("Error:", error);
      buildErrorResponse(res, "Failed to fetch course stats");
    }
  }
);

export default marksRouter;
