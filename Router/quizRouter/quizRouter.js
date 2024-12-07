import express from "express";
import {
  createQuiz,
  getAllQuizesList,
  getallSubmittedQuiz,
  getQuizByCourseId,
  getSubmittedQuiz,
  submitQuiz,
  updateQuizStatus,
} from "../../model/quizModel.js/quizModel.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
const quizRouter = express.Router();

// create a new quiz | POST | private Route | for tutor
quizRouter.post("/create", async (req, res) => {
  try {
    // Create a new quiz
    const quiz = await createQuiz(req.body);

    quiz?._id
      ? buildSuccessResponse(res, quiz, "Quiz created successfully!")
      : buildErrorResponse(res, "Quiz could not be created!");
  } catch (error) {
    console.error("Error while creating quiz:", error);
    return buildErrorResponse(res, "Error while creating quiz!");
  }
});

// get  all quizes  list |GET | Public Route | for tutor
quizRouter.get("/get", async (req, res) => {
  try {
    const quizzes = await getAllQuizesList();

    buildSuccessResponse(res, quizzes, "Quizzes fetched successfully!");
  } catch (error) {
    console.error("Error while fetching quizzes:", error);
    return buildErrorResponse(res, "Error while fetching quizzes!");
  }
});

// update a quiz status by ID  | PATCH | private Route | for tutor
quizRouter.patch("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedQuiz = await updateQuizStatus(id, status);

    updatedQuiz?._id
      ? buildSuccessResponse(
          res,
          updatedQuiz,
          "Quiz status updated successfully!"
        )
      : buildErrorResponse(res, "Quiz not found!");
  } catch (error) {
    console.error("Error while updating quiz status:", error);
    return buildErrorResponse(res, "Error while updating quiz status!");
  }
});

//get a Quiz by  CourseId  | GET | private Route |  for student
quizRouter.get("/quiz/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const quiz = await getQuizByCourseId(courseId);

    buildSuccessResponse(res, quiz, "Quiz fetched successfully!");
  } catch (error) {
    console.error("Error while fetching quiz:", error);
    return buildErrorResponse(res, "Error while fetching quiz!", 500);
  }
});

//QUIZ SUBMITSSION ROUTER / USER
// submitted a quiz by student | POST | private Route
quizRouter.post("/submit", async (req, res) => {
  try {
    const {
      quizId,
      studentId,
      studentName,
      courseId,
      submissionStatus,
      answers,
      totalQuestions,
      correctAnswers,
      totalMarks,
      obtainedMarks,
    } = req.body;

    // Validate that all required fields are present
    if (!quizId || !studentId || !courseId) {
      throw new Error("Missing required fields");
    }

    const answerObj = {
      quizId,
      studentId,
      studentName,
      courseId,
      submissionStatus: submissionStatus || "Completed",
      answers: answers.map((answer) => ({
        questionText: answer.questionText,
        studentAnswer: answer.studentAnswer,
        correctAnswer: answer.correctAnswer,
      })),
      totalQuestions,
      correctAnswers,
      totalMarks,
      obtainedMarks,
    };

    // Create a new QuizSubmission document
    const quizSubmission = await submitQuiz(answerObj);

    buildSuccessResponse(res, quizSubmission, "Quiz submitted successfully");
  } catch (error) {
    console.error("Error in while submitting Quiz:", error);
    buildErrorResponse(res, "Error in while submitting Quiz");
  }
});

// fetch  sumbitted quiz by student ID | GET | private Route
quizRouter.get(
  "/get-quiz/:quizId/:studentId",
  authMiddleware,
  async (req, res) => {
    try {
      const { quizId } = req.params;

      //auth middleware
      const studentId = req.userInfo._id;

      const submittedQuiz = await getSubmittedQuiz(quizId, studentId);

      buildSuccessResponse(
        res,
        submittedQuiz,
        "Submitted quizzes fetched successfully"
      );
    } catch (error) {
      console.error("Error while fetching submitted quizzes:", error);
      buildErrorResponse(res, "Error while fetching submitted quizzes!");
    }
  }
);

// fetch all submitted quiz by quiz ID | GET | private Route | for tutor
quizRouter.get("/get-all-quizes/:quizId", async (req, res) => {
  try {
    const allSubmittedQuiz = await getallSubmittedQuiz(req.params.quizId);

    buildSuccessResponse(
      res,
      allSubmittedQuiz,
      "Submitted quizzes fetched successfully"
    );
  } catch (error) {
    console.error("Error while fetching submitted quizzes:", error);
    buildErrorResponse(res, "Error while fetching submitted quizzes!");
  }
});

export default quizRouter;
