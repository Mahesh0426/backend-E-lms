import express from "express";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";
import CourseProgress from "../../Schema/studentSchema/courseProgressSchema.js";
import Course from "../../Schema/courseSchema.js";
import MyCourse from "../../Schema/studentSchema/myCoursesSchema.js";

const courseProgressRouter = express.Router();

//get current course progress | GET
courseProgressRouter.get("/:userId/:courseId", async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const studentPurchasedCourses = await MyCourse.findOne({ userId });

    const isCurrentCoursePurchasedByCurrentUserOrNot =
      studentPurchasedCourses?.courses?.findIndex(
        (item) => item.courseId === courseId
      ) > -1;
    if (!isCurrentCoursePurchasedByCurrentUserOrNot) {
      return buildSuccessResponse(
        res,
        { isPurchased: false },
        "you need to purchase this course!!"
      );
    }
    const currentUserCourseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (
      !currentUserCourseProgress ||
      currentUserCourseProgress?.lecturesProgress?.length === 0
    ) {
      const course = await Course.findById(courseId);
      if (!course) {
        return buildErrorResponse(res, "Course not found.", 404);
      }
      return buildSuccessResponse(
        res,
        {
          courseDetails: course,
          progress: [],
          isPurchased: true,
        },
        "no progress found you can start watching  the courses"
      );
    }
    const courseDetails = await Course.findById(courseId);
    buildSuccessResponse(
      res,
      {
        courseDetails,
        progress: currentUserCourseProgress.lecturesProgress,
        completed: currentUserCourseProgress.completed,
        completionDate: currentUserCourseProgress.completionDate,
        isPurchased: true,
      },
      "courseDetails"
    );
  } catch (error) {
    console.error("Error getting course progress info:", error);
    buildErrorResponse(
      res,
      "Some error occurred while getting course progress info.",
      500
    );
  }
});

//mark current lecture as viewed | POST
courseProgressRouter.post("/mark-lecture-view", async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [
          {
            lectureId,
            viewed: true,
            dateViewed: new Date(),
          },
        ],
      });
      await progress.save();
    } else {
      const lectureProgress = progress.lecturesProgress.find(
        (item) => item.lectureId === lectureId
      );
      if (lectureProgress) {
        lectureProgress.viewed = true;
        lectureProgress.dateViewed = new Date();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
        });
      }
      await progress.save();
    }
    const course = await Course.findById(courseId);

    if (!course) {
      return buildErrorResponse(res, "Course not found", 404);
    }

    //check if all the lectures are viewd or not
    const allLecturesViewed =
      progress.lecturesProgress.length === course.curriculum.length &&
      progress.lecturesProgress.every((item) => item.viewed);

    if (allLecturesViewed) {
      progress.completed = true;
      progress.completionDate = new Date();

      await progress.save();
    }
    return buildSuccessResponse(res, progress, "Lecture marked as viewed!");
  } catch (error) {
    console.error("Error marking lecture as viewed:", error);
    buildErrorResponse(
      res,
      "Some error occurred while marking lecture as viewed.",
      500
    );
  }
});
//reset course progress | POST
courseProgressRouter.post("/reset-progress", async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return buildErrorResponse(res, "progress not found", 404);
    }
    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = null;

    await progress.save();

    return buildSuccessResponse(res, progress, "progress reset successfully!");
  } catch (error) {
    console.error("Error resetting course progress info:", error);
    buildErrorResponse(
      res,
      "Some error occurred while resetting course progress info.",
      500
    );
  }
});

export default courseProgressRouter;
