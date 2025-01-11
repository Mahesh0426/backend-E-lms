import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  public_id: { type: String, required: true },
  freePreview: { type: Boolean, default: false },
});

const courseSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorEmail: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    primaryLanguage: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    welcomeMessage: {
      type: String,
      required: true,
    },
    pricing: {
      type: Number,
      required: true,
      min: 0,
    },
    averageRating: {
      type: Number,
    },
    objectives: {
      type: String,
      required: true,
    },
    students: [
      {
        studentId: { type: String, required: true },
        studentName: { type: String, required: true },
        studentEmail: { type: String, required: true },
        paidAmount: { type: Number, required: true },
        enrolledAt: { type: Date, default: Date.now },
      },
    ],
    curriculum: [lectureSchema],
    isPublished: Boolean,
  },
  {
    timestamps: true,
  }
);
courseSchema.index({ _id: 1, "students.studentId": 1 }, { unique: true });

export default mongoose.model("Course", courseSchema);
