import express from "express";
import Course from "../../Schema/courseSchema.js";
import AssignmentSubmission from "../../Schema/assessmentSchema/assignmentSubmissionSchema.js";
import QuizSubmission from "../../Schema/quiz/quizSubmissionSchema.js";
import CourseProgress from "../../Schema/studentSchema/courseProgressSchema.js";
import MyCourses from "../../Schema/studentSchema/myCoursesSchema.js";
import User from "../../Schema/userSchema.js";
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

marksRouter.get(
  "/get-course-stats/instructor/:instructorId",
  async (req, res) => {
    const { instructorId } = req.params;

    try {
      // 1. Find all courses for this instructor
      const courses = await Course.find({ instructorId }).lean();
      const courseIds = courses.map((course) => course._id.toString());

      // 2. Fetch all assignment submissions, quiz submissions, and MyCourses in one go
      const [assignmentSubmissions, quizSubmissions, allMyCoursesDocs] =
        await Promise.all([
          AssignmentSubmission.find({ courseId: { $in: courseIds } }).lean(),
          QuizSubmission.find({ courseId: { $in: courseIds } }).lean(),
          MyCourses.find({ "courses.courseId": { $in: courseIds } }).lean(),
        ]);

      // 3. Create maps for quick access
      const assignmentScoresMap = assignmentSubmissions.reduce(
        (acc, submission) => {
          acc[submission.courseId] = acc[submission.courseId] || [];
          acc[submission.courseId].push(submission.score || 0);
          return acc;
        },
        {}
      );

      const quizScoresMap = quizSubmissions.reduce((acc, submission) => {
        acc[submission.courseId] = acc[submission.courseId] || [];
        acc[submission.courseId].push(submission.obtainedMarks || 0);
        return acc;
      }, {});

      // 4. Prepare enrolled user IDs
      const enrolledUserIdsMap = {};
      allMyCoursesDocs.forEach((doc) => {
        doc.courses.forEach((course) => {
          if (courseIds.includes(course.courseId)) {
            enrolledUserIdsMap[course.courseId] =
              enrolledUserIdsMap[course.courseId] || new Set();
            enrolledUserIdsMap[course.courseId].add(doc.userId);
          }
        });
      });

      // Convert Set to Array before querying CourseProgress
      const uniqueUserIds = {};
      for (const courseId in enrolledUserIdsMap) {
        uniqueUserIds[courseId] = [...enrolledUserIdsMap[courseId]]; // Convert Set to Array
      }

      // 5. Fetch progress for all enrolled users in one go
      const progressDocs = await CourseProgress.find({
        courseId: { $in: courseIds },
        userId: { $in: [].concat(...Object.values(uniqueUserIds)) }, // Flatten arrays of user IDs
      }).lean();

      // 6. Build progress map for quick access
      const progressMap = {};
      progressDocs.forEach((progress) => {
        progressMap[progress.userId] = progress;
      });

      // 7. Calculate stats for each course
      const results = courses.map((course) => {
        const courseId = course._id.toString();

        // Calculate averages
        const assignmentScores = assignmentScoresMap[courseId] || [];
        const quizScores = quizScoresMap[courseId] || [];

        const assignmentAvg =
          assignmentScores.length > 0
            ? assignmentScores.reduce((acc, cur) => acc + cur, 0) /
              assignmentScores.length
            : 0;

        const quizAvg =
          quizScores.length > 0
            ? quizScores.reduce((acc, cur) => acc + cur, 0) / quizScores.length
            : 0;

        // Get enrolled user IDs
        const enrolledUserIds = [...(enrolledUserIdsMap[courseId] || [])];
        const totalEnrolled = enrolledUserIds.length;

        // Count progress stats
        let completedCount = 0;
        let notStartedCount = 0;
        let inProgressCount = 0;

        enrolledUserIds.forEach((userId) => {
          const userProgress = progressMap[userId];
          if (!userProgress) {
            notStartedCount++;
          } else if (userProgress.completed) {
            completedCount++;
          } else if (
            !userProgress.lecturesProgress ||
            userProgress.lecturesProgress.length === 0
          ) {
            notStartedCount++;
          } else {
            inProgressCount++;
          }
        });

        return {
          courseId,
          courseTitle: course.title,
          assignmentAverage: assignmentAvg,
          quizAverage: quizAvg,
          totalEnrolled,
          progressStats: {
            notStarted: notStartedCount,
            inProgress: inProgressCount,
            completed: completedCount,
          },
        };
      });

      // 8. Return the results array
      buildSuccessResponse(res, results, "Course stats fetched successfully!");
    } catch (error) {
      console.error("Error:", error);
      buildErrorResponse(res, "Failed to fetch course stats");
    }
  }
);

// GET Activity Log by instructor id  | GET
marksRouter.get(
  "/get-activity-log/instructor/:instructorId",
  async (req, res) => {
    const { instructorId } = req.params;

    try {
      // 1. Find all courses for this instructor
      const courses = await Course.find({ instructorId }).lean();
      const courseIds = courses.map((course) => course._id.toString());

      // 2. Fetch all necessary data in parallel
      const [
        assignmentSubmissions,
        quizSubmissions,
        allMyCoursesDocs,
        userDocs,
      ] = await Promise.all([
        AssignmentSubmission.find({ courseId: { $in: courseIds } }).lean(),
        QuizSubmission.find({ courseId: { $in: courseIds } }).lean(),
        MyCourses.find({ "courses.courseId": { $in: courseIds } }).lean(),
        User.find({}).lean(), // Fetch all users
      ]);

      // Extract all userIds and their associated courseIds from MyCourses
      const userCoursePairs = allMyCoursesDocs.flatMap((doc) =>
        doc.courses.map((course) => ({
          userId: doc.userId,
          courseId: course.courseId,
        }))
      );

      // 3. Fetch CourseProgress using userId and courseId
      const userProgressDocs = await CourseProgress.find({
        $or: userCoursePairs.map(({ userId, courseId }) => ({
          userId,
          courseId,
        })),
      }).lean();

      // 4. Create maps for quick access
      const userMap = userDocs.reduce((acc, user) => {
        acc[user._id] = user.userName || "Unknown User"; // Map userId to userName
        return acc;
      }, {});

      const userProgressMap = userProgressDocs.reduce((acc, progress) => {
        const key = `${progress.userId}_${progress.courseId}`;
        acc[key] = progress.completed ? "completed" : "inProgress";
        return acc;
      }, {});

      const assignmentLogMap = assignmentSubmissions.reduce(
        (acc, submission) => {
          acc[submission.courseId] = acc[submission.courseId] || [];
          acc[submission.courseId].push({
            userId: submission.studentId,
            userName: userMap[submission.studentId] || "Unknown User", // Add userId and userName
            score: submission.score || 0,
            submissionDate: submission.submissionDate || null,
          });
          return acc;
        },
        {}
      );

      const quizLogMap = quizSubmissions.reduce((acc, submission) => {
        acc[submission.courseId] = acc[submission.courseId] || [];
        acc[submission.courseId].push({
          userId: submission.studentId,
          userName: userMap[submission.studentId] || "Unknown User", // Add userId and userName
          obtainedMarks: submission.obtainedMarks || 0,
          submittedAt: submission.submittedAt || null,
        });
        return acc;
      }, {});

      const purchaseLogMap = allMyCoursesDocs.reduce((acc, doc) => {
        doc.courses.forEach((course) => {
          if (courseIds.includes(course.courseId)) {
            const key = `${doc.userId}_${course.courseId}`;
            acc[course.courseId] = acc[course.courseId] || [];
            acc[course.courseId].push({
              userId: doc.userId,
              userName: userMap[doc.userId] || "Unknown User", // Fetch userName from userMap
              dateOfPurchase: course.dateofPurschase || null,
              courseProgress: userProgressMap[key] || "notStarted", // Add course progress
            });
          }
        });
        return acc;
      }, {});

      // 5. Build activity log for each course
      const activityLogs = courses.map((course) => {
        const courseId = course._id.toString();

        const assignmentLogs = assignmentLogMap[courseId] || [];
        const quizLogs = quizLogMap[courseId] || [];
        const purchaseLogs = purchaseLogMap[courseId] || [];

        return {
          courseId,
          courseTitle: course.title,
          assignmentLogs,
          quizLogs,
          purchaseLogs,
        };
      });

      // 6. Return the activity logs
      buildSuccessResponse(
        res,
        activityLogs,
        "Activity logs fetched successfully!"
      );
    } catch (error) {
      console.error("Error:", error);
      buildErrorResponse(res, "Failed to fetch activity logs");
    }
  }
);

export default marksRouter;
