import express from "express";
import reviewSchema from "../../Schema/studentSchema/reviewSchema.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { log } from "@tensorflow/tfjs-node";

const reviewRouter = express.Router();

// POST | create a review for a course | authenticated route
reviewRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const review = new reviewSchema(req.body);

    await review.save();

    review._id
      ? buildSuccessResponse(res, review, "review created successfully!!")
      : buildErrorResponse(res, "no review available");
  } catch (error) {
    console.error("Error creating review:", error);
    buildErrorResponse(res, "Error creating review.");
  }
});

// GET  | get all the  review based on Course ID
reviewRouter.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const review = await reviewSchema
      .find({ courseId })
      .populate("studentId", "userName");

    review && review?.length > 0
      ? buildSuccessResponse(res, review, "review fetched successfully!!")
      : buildErrorResponse(res, "no review available for this course");
  } catch (error) {
    console.error("Error fetching review:", error);
    buildErrorResponse(res, "Error fetching review.");
  }
});

export default reviewRouter;
