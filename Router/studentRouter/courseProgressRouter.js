import express, { response } from "express";
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

//get course progress percentage  | GET
courseProgressRouter.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(studentId);

    // Find all courses where the student is enrolled
    const courses = await Course.find({ "students.studentId": studentId });

    if (!courses || courses.length === 0) {
      return res.json({
        message: "No courses found for this student.",
        courses: [],
      });
    }

    // Fetch progress for each course
    const result = await Promise.all(
      courses.map(async (course) => {
        // Get the student's progress for the course
        const progress = await CourseProgress.findOne({
          userId: studentId,
          courseId: course._id,
        });

        // Calculate total lectures and viewed lectures
        const totalLectures = course.curriculum.length;
        const viewedLectures = progress
          ? progress.lecturesProgress.filter((lecture) => lecture.viewed).length
          : 0;

        // Calculate progress percentage
        const progressPercentage = totalLectures
          ? Math.round((viewedLectures / totalLectures) * 100)
          : 0;

        // Return course details with progress percentage
        return {
          courseId: course._id,
          title: course.title,
          progressPercentage,
        };
      })
    );

    // Send the result
    buildSuccessResponse(
      res,
      result,
      "course progress percentage fetched successfully!!"
    );
  } catch (error) {
    console.error("Error fetching student courses with progress:", error);
    buildErrorResponse(
      res,
      "Some error occurred while fetching student courses and progress.",
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
    } else {
      progress.completed = false;
      progress.completionDate = null;
    }
    await progress.save();
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
