import mongoose from "mongoose";

const MyCoursesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  courses: [
    {
      courseId: { type: String, required: true },
      title: { type: String, required: true },
      instructorId: { type: String, required: true },
      instructorEmail: { type: String, required: true },
      instructorName: { type: String, required: true },
      dateofPurschase: { type: Date, required: true },
      courseImage: { type: String, required: true },
    },
  ],
});

MyCoursesSchema.index({ userId: 1, "courses.courseId": 1 }, { unique: true });
export default mongoose.model("MyCourses", MyCoursesSchema);
