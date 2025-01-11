import express from "express";
import reviewSchema from "../../Schema/studentSchema/reviewSchema.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import Course from "../../Schema/courseSchema.js";

const reviewRouter = express.Router();

// POST | create a review for a course | authenticated route
reviewRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    // 1. Create a new review
    const review = new reviewSchema(req.body);
    await review.save();

    // 2. Calculate the average rating for the course
    const { courseId } = req.body;
    const reviews = await reviewSchema.find({ courseId });

    // Calculate the average rating
    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    // 3. Update the course's average rating
    await Course.findByIdAndUpdate(courseId, { averageRating });

    // 4. Send a success response
    buildSuccessResponse(res, review, "Review created successfully!!");
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
