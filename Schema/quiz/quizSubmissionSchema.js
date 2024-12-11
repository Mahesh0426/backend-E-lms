import mongoose from "mongoose";

const quizSubmissionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: { type: String },
    submissionStatus: {
      type: String,
      enum: ["Completed", "Not Completed"],
      default: "Not Completed",
    },
    answers: [
      {
        questionText: {
          type: String,
          required: true,
        },
        studentAnswer: {
          type: String,
          required: true,
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate correctness and marks
quizSubmissionSchema.pre("save", function (next) {
  // Calculate isCorrect for each answer
  this.answers.forEach((answer) => {
    answer.isCorrect = answer.studentAnswer === answer.correctAnswer;
  });

  // Calculate correct answers
  this.correctAnswers = this.answers.filter(
    (answer) => answer.isCorrect
  ).length;

  // Calculate obtained marks
  this.obtainedMarks = this.totalQuestions
    ? (this.correctAnswers * this.totalMarks) / this.totalQuestions
    : 0;

  next();
});

export default mongoose.model("QuizSubmission", quizSubmissionSchema);
