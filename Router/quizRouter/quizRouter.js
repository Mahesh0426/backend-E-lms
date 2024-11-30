import express from "express";
import {
  createQuiz,
  getAllQuizesList,
  getQuizByCourseId,
  updateQuizStatus,
} from "../../model/quizModel.js/quizModel.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
const quizRouter = express.Router();

// create a new quiz | POST | private Route
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

// get  all quizes  list |GET | Public Route
quizRouter.get("/get", async (req, res) => {
  try {
    const quizzes = await getAllQuizesList();

    quizzes.length > 0
      ? buildSuccessResponse(res, quizzes, "Quizzes fetched successfully!")
      : buildErrorResponse(res, "No quizzes found!");
  } catch (error) {
    console.error("Error while fetching quizzes:", error);
    return buildErrorResponse(res, "Error while fetching quizzes!");
  }
});

//get a Quiz by  CourseId  | GET | public Route
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

// update a quiz status by ID  | PATCH | private Route
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
export default quizRouter;
