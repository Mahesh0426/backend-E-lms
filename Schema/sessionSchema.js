import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Sessions
export default mongoose.model("Session", sessionSchema);
