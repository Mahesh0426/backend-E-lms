import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  orderStatus: { type: String, default: "pending", required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: "unpaid", required: true },
  orderDate: { type: Date, default: Date.now },
  paymentId: { type: String },
  payerId: { type: String },
  instructorId: { type: String, required: true },
  instructorName: { type: String, required: true },
  instructorEmail: { type: String, required: true },
  courseImage: { type: String, required: true },
  courseTitle: { type: String, required: true },
  courseId: { type: String, required: true },
  coursePricing: { type: String, required: true },
});

// // Ensure unique order per user and course
// OrderSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Order", OrderSchema);
