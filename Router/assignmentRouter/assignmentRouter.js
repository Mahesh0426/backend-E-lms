import express from "express";

import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import {
  createAssignment,
  getAllAssignmentList,
  getAssignmentByCourseId,
  updateAssignmentStatus,
} from "../../model/assessmentModel/assessmentModel.js";
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

//get a Quiz by CourseId  | GET | public Route
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
export default assignmmentRouter;
