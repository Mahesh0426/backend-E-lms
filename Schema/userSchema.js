import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // isVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    role: {
      type: String,
      default: "user",
    },
    userName: {
      type: String,
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
      unique: true,
      index: 1,
    },

    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    learningGoals: {
      type: String,
      enum: ["Career Change", "Skill Improvement", "Personal Growth"],
    },
    primaryInterests: {
      type: String,
      enum: ["Business", "Technology", "Health", "Science", "Other"],
      default: "Other",
    },
    language: {
      type: String,
      enum: ["English", "Hindi", "Nepali", "Bengali", "Urdu"],
      default: "English",
    },
  },
  {
    timestamps: true,
  }
);

// Users
export default mongoose.model("User", userSchema);
