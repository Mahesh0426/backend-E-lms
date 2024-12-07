import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },

    submissionStatus: {
      type: String,
      enum: ["Submitted", "Not submitted"],
      default: "Submitted",
    },
    gradingStatus: {
      type: String,
      enum: ["Graded", "Not graded"],
      default: "Not graded",
    },

    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    score: {
      type: Number,
    },

    review: {
      type: String,
    },
    gradingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
// // Compound index to ensure unique student submission per assignment
// assignmentSubmissionSchema.index(
//   { assignmentId: 1, studentId: 1 },
//   { unique: true }
// );

export default mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);
