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
  },
  {
    timestamps: true,
  }
);

// Users
export default mongoose.model("User", userSchema);
