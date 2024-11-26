import mongoose from "mongoose";

const MyCoursesSchema = new mongoose.Schema({
  userId: String,
  courses: [
    {
      courseId: String,
      title: String,
      instructorId: String,
      instructorEmail: String,
      instructorName: String,
      dateofPurschase: Date,
      courseImage: String,
    },
  ],
});

export default mongoose.model("MyCourses", MyCoursesSchema);
