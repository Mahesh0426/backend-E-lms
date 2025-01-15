import express from "express";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import {
  createAssignment,
  createAssignmentSubmission,
  deleteAssignment,
  findSubmissionByIds,
  getAllAssignmentList,
  getAllSubmittedAssignmentList,
  getAssignmentByCourseId,
  getSubmittedAssignmentbyId,
  saveSubmission,
  updateAssignment,
  updateAssignmentStatus,
} from "../../model/assessmentModel/assessmentModel.js";
import mongoose from "mongoose";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const assignmmentRouter = express.Router();

// create a new assignmment | POST | private Route | for tutor
assignmmentRouter.post("/create", async (req, res) => {
  try {
    // Create a new assignmment
    const assignmment = await createAssignment(req.body);

    assignmment?._id
      ? buildSuccessResponse(
          res,
          assignmment,
          "assignmment created successfully!"
        )
      : buildErrorResponse(res, "assignmment could not be created!");
  } catch (error) {
    console.error("Error while creating assignmment:", error);
    return buildErrorResponse(res, "Error while creating assignmment!");
  }
});

// edit\update  assignment | PATCH | private Route | for tutor
assignmmentRouter.patch("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, maxScore } = req.body;

    const updatedAssignment = await updateAssignment(id, {
      title,
      description,
      dueDate,
      maxScore,
    });

    updatedAssignment?._id
      ? buildSuccessResponse(
          res,
          updatedAssignment,
          "assignmment updated successfully!"
        )
      : buildErrorResponse(res, "assignmment could not be updated!");
  } catch (error) {
    console.error("Error while updating assignmment:", error);
    return buildErrorResponse(res, "Error while updating assignmment!");
  }
});

// delete assignment | DELETE | private Route
assignmmentRouter.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAssignment = await deleteAssignment(id);

    deletedAssignment?._id
      ? buildSuccessResponse(
          res,
          deletedAssignment,
          "assignmment deleted successfully!"
        )
      : buildErrorResponse(res, "assignmment could not be deleted!");
  } catch (error) {
    console.error("Error while deleting assignmment:", error);
    return buildErrorResponse(res, "Error while deleting assignmment!");
  }
});

// get  all assignmment  list by instructorId |GET | Public Route | for tutor
assignmmentRouter.get("/get/:id", authMiddleware, async (req, res) => {
  try {
    //get from auth middleware
    const instructorId = req.userInfo.id;

    const assignmments = await getAllAssignmentList(instructorId);

    buildSuccessResponse(
      res,
      assignmments,
      "assignmments fetched successfully!"
    );
  } catch (error) {
    console.error("Error while fetching assignmments:", error);
    return buildErrorResponse(res, "Error while fetching assignmments!");
  }
});

//get a assignmment by CourseId  | GET | public Route | for Student
assignmmentRouter.get("/assignment/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const assignment = await getAssignmentByCourseId(courseId);

    buildSuccessResponse(res, assignment, "Quiz fetched successfully!");
  } catch (error) {
    console.error("Error while fetching quiz:", error);
    return buildErrorResponse(res, "Error while fetching quiz!", 500);
  }
});

// update a assignmment status by ID  | PATCH | private Route |   for tutor
assignmmentRouter.patch("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedAssignment = await updateAssignmentStatus(id, status);

    updatedAssignment?._id
      ? buildSuccessResponse(
          res,
          updatedAssignment,
          "assignmment status updated successfully!"
        )
      : buildErrorResponse(res, "assignmment not found!");
  } catch (error) {
    console.error("Error while updating assignmment status:", error);
    return buildErrorResponse(res, "Error while updating assignmment status!");
  }
});

//ASSIGNMENT SUBMITSSION / user

//   create a  new assignment Submission | POST | private Route
assignmmentRouter.post("/create-submission", async (req, res) => {
  try {
    const assignmentSubmission = await createAssignmentSubmission(req.body);

    assignmentSubmission?._id
      ? buildSuccessResponse(
          res,
          assignmentSubmission,
          "Assignment Submission created successfully!"
        )
      : buildErrorResponse(res, "Assignment Submission could not be created!");
  } catch (error) {
    console.error("Error while creating Assignment Submission:", error);
    return buildErrorResponse(
      res,
      "Error while creating Assignment Submission!"
    );
  }
});

// get  particular submitted  assignment by studentId and assignmentId  | GET | public Route
assignmmentRouter.get(
  "/get-submission/:assignmentId/:studentId",
  authMiddleware,
  async (req, res) => {
    try {
      const { assignmentId } = req.params;

      //auth middleware
      const studentId = req.userInfo._id;

      const assignmentSubmission = await getSubmittedAssignmentbyId(
        assignmentId,
        studentId
      );

      buildSuccessResponse(
        res,
        assignmentSubmission,
        "Assignment Submission fetched successfully!"
      );
    } catch (error) {
      console.error("Error while fetching Assignment a Submission:", error);
    }
  }
);

// get  all assignments Submission list by assignment ID | GET | Public Route |  for  tutor
assignmmentRouter.get("/get-allSubmissions/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Validate and convert id to ObjectId
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ error: "Invalid student ID format" });
    }

    const assignmentSubmissions = await getAllSubmittedAssignmentList(
      assignmentId
    );

    if (assignmentSubmissions.length > 0) {
      buildSuccessResponse(
        res,
        assignmentSubmissions,
        "Assignment Submissions fetched successfully!"
      );
    }
  } catch (error) {
    console.error("Error while fetching Assignment all Submissions:", error);
    return buildErrorResponse(
      res,
      "Error while fetching Assignment all  Submissions!"
    );
  }
});

//  update score and review  by tutor  | PATCH | private Route
assignmmentRouter.patch(
  "/grade-submission/:assignmentId/:studentId",
  async (req, res) => {
    try {
      const { assignmentId, studentId } = req.params;
      const { score, review, gradedBy } = req.body;

      // Find the submission by assignmentId and studentId
      const submission = await findSubmissionByIds(assignmentId, studentId);

      // Update grading fields
      submission.score = score;
      submission.review = review || submission.review;
      submission.gradingStatus = "Graded";
      submission.gradingDate = new Date();
      submission.gradedBy = gradedBy;

      // Save the updated document using the saveSubmission function
      const updatedSubmission = await saveSubmission(submission);

      buildSuccessResponse(
        res,
        updatedSubmission,
        "submission updated successfully"
      );
    } catch (error) {
      console.error("Error while grading submission:", error);
      buildErrorResponse(res, "Error while saving submission");
    }
  }
);

// edit assignment score | PATCH |  for tutor
assignmmentRouter.patch(
  "/edit-score/:assignmentId/:studentId",
  async (req, res) => {
    try {
      const { assignmentId, studentId } = req.params;
      const { score, review } = req.body;

      // Find the submission by assignmentId and studentId
      const submission = await findSubmissionByIds(assignmentId, studentId);

      // Update score field
      submission.score = score;
      submission.review = review || submission.review;

      // Save the updated document using the saveSubmission function
      const updatedSubmission = await saveSubmission(submission);

      buildSuccessResponse(
        res,
        updatedSubmission,
        "Grade updated successfully"
      );
    } catch (error) {
      console.error("Error while editing score:", error);
      buildErrorResponse(res, "Error while saving submission");
    }
  }
);
export default assignmmentRouter;
