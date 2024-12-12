import express from "express";
import Course from "../../Schema/courseSchema.js";
import AssignmentSubmission from "../../Schema/assessmentSchema/assignmentSubmissionSchema.js";
import QuizSubmission from "../../Schema/quiz/quizSubmissionSchema.js";
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

export default marksRouter;
