import express from "express";

import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import {
  createAssignment,
  createAssignmentSubmission,
  getAllAssignmentList,
  getAllSubmittedAssignmentList,
  getAssignmentByCourseId,
  getSubmittedAssignmentbyId,
  updateAssignmentStatus,
} from "../../model/assessmentModel/assessmentModel.js";
import AssignmentSubmission from "../../Schema/assessmentSchema/assignmentSubmissionSchema.js";
import mongoose from "mongoose";

const assignmmentRouter = express.Router();

// create a new assignmment | POST | private Route
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

// get  all assignmment  list |GET | Public Route
assignmmentRouter.get("/get", async (req, res) => {
  try {
    const assignmments = await getAllAssignmentList();

    assignmments.length > 0
      ? buildSuccessResponse(
          res,
          assignmments,
          "assignmments fetched successfully!"
        )
      : buildErrorResponse(res, "No assignmments found!");
  } catch (error) {
    console.error("Error while fetching assignmments:", error);
    return buildErrorResponse(res, "Error while fetching assignmments!");
  }
});

//get a assignmment by CourseId  | GET | public Route
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

// update a assignmment status by ID  | PATCH | private Route
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

//   create a  new assignment Submission | POST | | private Route
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

// get  all assignments Submission list | GET | Public Route
assignmmentRouter.get("/get-allSubmissions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const assignmentSubmissions = await getAllSubmittedAssignmentList(id);

    assignmentSubmissions.length > 0
      ? buildSuccessResponse(
          res,
          assignmentSubmissions,
          "Assignment Submissions fetched successfully!"
        )
      : buildErrorResponse(res, "No Assignment Submissions found!");
  } catch (error) {
    console.error("Error while fetching Assignment Submissions:", error);
    return buildErrorResponse(
      res,
      "Error while fetching Assignment Submissions!"
    );
  }
});

// get   submitted  assignment by id  | GET | public Route
assignmmentRouter.get("/get-submission/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received submission ID:", id);

    const assignmentSubmission = await getSubmittedAssignmentbyId(id);

    buildSuccessResponse(
      res,
      assignmentSubmission,
      "Assignment Submission fetched successfully!"
    );
  } catch (error) {
    console.error("Error while fetching Assignment Submission:", error);
  }
});
//  grade a submission | PATCH | private Route
assignmmentRouter.patch(
  "/grade-submission/:assignmentId/:studentId",
  async (req, res) => {
    try {
      const { assignmentId, studentId } = req.params;
      const { score, review, gradedBy } = req.body;

      // Validate the score
      if (score < 0) {
        return res
          .status(400)
          .json({ message: "Score must be a non-negative number." });
      }

      // Find the submission by assignmentId and studentId
      const submission = await AssignmentSubmission.findOne({
        assignmentId,
        studentId,
      });
      if (!submission) {
        return res.status(404).json({ message: "Submission not found." });
      }

      // Update grading fields
      submission.score = score;
      submission.review = review || submission.review;
      submission.gradingStatus = "Graded";
      submission.gradingDate = new Date();
      submission.gradedBy = gradedBy;

      // Save the updated document
      const updatedSubmission = await submission.save();

      res.status(200).json({
        message: "Submission graded successfully.",
        submission: updatedSubmission,
      });
    } catch (error) {
      console.error("Error while grading submission:", error);
      res.status(500).json({ message: "Error while grading submission." });
    }
  }
);

export default assignmmentRouter;
