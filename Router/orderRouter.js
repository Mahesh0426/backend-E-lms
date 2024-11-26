import express from "express";
import {
  addCourseToStudent,
  createPaypalPaymentConfig,
} from "../utility/paymentHelper.js";
import paypal from "../config/payPalConfig.js";
import Order from "../Schema/orderSchema.js";
import Course from "../Schema/courseSchema.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/reponseHelper.js";

const orderRouter = express.Router();

//  POST | create  payment
orderRouter.post("/create", async (req, res) => {
  try {
    const orderDetails = req.body;

    const createPaymentJson = createPaypalPaymentConfig(
      orderDetails.courseTitle,
      orderDetails.courseId,
      orderDetails.coursePricing
    );

    // Create PayPal payment
    paypal.payment.create(createPaymentJson, async (error, paymentInfo) => {
      if (error) {
        console.error("PayPal payment creation error:", error);
        return buildErrorResponse(res, "Error creating PayPal payment.");
      }

      // Create and save a new order record
      const newlyCreatedCourseOrder = new Order(orderDetails);
      await newlyCreatedCourseOrder.save();

      // Get approval URL from PayPal to redirect user
      const approveUrl = paymentInfo.links.find(
        (link) => link.rel === "approval_url"
      ).href;

      buildSuccessResponse(
        res,
        { approveUrl, orderId: newlyCreatedCourseOrder._id },
        "Order created successfully!"
      );
    });
  } catch (error) {
    console.error("Unexpected error in createOrder:", error);
    buildErrorResponse(res, "Error creating order.");
  }
});

//  POST | capture payment and finalize order
orderRouter.post("/capture", async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    // Find and verify the order
    const order = await Order.findById(orderId);

    if (!order) return buildErrorResponse(res, "Order not found.");

    // Update order status as paid and save payment details
    Object.assign(order, {
      paymentStatus: "paid",
      orderStatus: "confirmed",
      paymentId,
      payerId,
    });
    await order.save();

    // Add course to student’s purchased list | myCourseSchema
    const courseDetails = {
      courseId: order.courseId,
      title: order.courseTitle,
      instructorId: order.instructorId,
      instructorName: order.instructorName,
      dateOfPurchase: order.orderDate,
      courseImage: order.courseImage,
    };
    await addCourseToStudent(order.userId, courseDetails);

    // Add student to course in students | courseSchema
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });

    buildSuccessResponse(res, order, "Payment captured and order finalized!");
  } catch (error) {
    console.error("Unexpected error in capturePaymentAndFinalizeOrder:", error);
    buildErrorResponse(res, "Error capturing payment and finalizing order.");
  }
});

export default orderRouter;
