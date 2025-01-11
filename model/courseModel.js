import courseSchema from "../Schema/courseSchema.js";

// CREATE A COURSE
export const createCourse = (courseObj) => {
  return courseSchema(courseObj).save();
};

// UPDATE
export const updateCourse = (updatedObject) => {
  return courseSchema.findByIdAndUpdate(updatedObject?._id, updatedObject, {
    new: true,
  });
};

//  DELETE
export const deleteCourse = (_id) => {
  return courseSchema.findByIdAndDelete(_id);
};

// DELETE LECTURE
export const deleteLecture = (courseId, lectureId) => {
  return courseSchema.findByIdAndUpdate(
    courseId,
    { $pull: { curriculum: { _id: lectureId } } },
    { new: true }
  );
};

// GET Course BY ID
export const getCourse = (_id) => {
  return courseSchema.findById(_id);
};

// GET ALL Courses for instructor
export const getCourses = (instructorId) => {
  return courseSchema.find({ instructorId });
};

// GET ALL Courses for student
export const getStudentCourses = ({ filters, sortParam }) => {
  return courseSchema.find(filters).sort(sortParam);
};

// GET COURSE BY slug
export const getCourseSlug = (slug) => {
  return courseSchema.findOne({ slug });
};
