import myCoursesSchema from "../Schema/myCoursesSchema.js";

//find course by student id
export const findCourseById = (studentId) => {
  return myCoursesSchema.findOne({ userId: studentId });
};
