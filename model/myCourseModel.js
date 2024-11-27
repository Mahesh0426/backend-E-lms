import myCoursesSchema from "../Schema/studentSchema/myCoursesSchema.js";

//find course by student id
export const findCourseById = (studentId) => {
  return myCoursesSchema.findOne({ userId: studentId });
};
