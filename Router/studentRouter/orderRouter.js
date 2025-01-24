import express from "express";
import {
  addCourseToStudent,
  createPaypalPaymentConfig,
} from "../../utility/paymentHelper.js";
import paypal from "../../config/payPalConfig.js";
import Order from "../../Schema/studentSchema/orderSchema.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../../utility/reponseHelper.js";

const orderRouter = express.Router();

//  POST | create  payment
// orderRouter.post("/create", async (req, res) => {
//   try {
//     const orderDetails = req.body;

//     // Check if the order already exists for the user and course
//     const existingOrder = await Order.findOne({
//       userId: orderDetails.userId,
//       courseId: orderDetails.courseId,
//       orderStatus: orderDetails.orderStatus,
//     });

//     if (existingOrder) {
//       console.log("Order already exists for this user and course.");
//       return buildErrorResponse(res, "Duplicate order. Order already exists.");
//     }

//     const createPaymentJson = createPaypalPaymentConfig(
//       orderDetails.courseTitle,
//       orderDetails.courseId,
//       orderDetails.coursePricing
//     );

//     // Create PayPal payment
//     paypal.payment.create(createPaymentJson, async (error, paymentInfo) => {
//       if (error) {
//         console.error("PayPal payment creation error:", error);
//         return buildErrorResponse(res, "Error creating PayPal payment.");
//       }

//       // Create and save a new order record
//       const newlyCreatedCourseOrder = new Order(orderDetails);

//       await newlyCreatedCourseOrder.save();

//       // Get approval URL from PayPal to redirect user
//       const approveUrl = paymentInfo.links.find(
//         (link) => link.rel === "approval_url"
//       ).href;

//       buildSuccessResponse(
//         res,
//         { approveUrl, orderId: newlyCreatedCourseOrder._id },
//         "Order created successfully!"
//       );
//     });
//   } catch (error) {
//     console.error("Unexpected error in createOrder:", error);
//     buildErrorResponse(res, "Error creating order.");
//   }
// });

orderRouter.post("/create", async (req, res) => {
  try {
    const orderDetails = req.body;

    // Check if an order exists for the user and course
    const existingOrder = await Order.findOne({
      userId: orderDetails.userId,
      courseId: orderDetails.courseId,
    });

    if (existingOrder) {
      if (existingOrder.orderStatus === "confirmed") {
        console.log("Order is already confirmed for this user and course.");
        return buildErrorResponse(
          res,
          "You cannot reorder this course as the order is already confirmed."
        );
      } else if (existingOrder.orderStatus === "pending") {
        // Update the existing pending order
        const updatedOrder = await Order.findByIdAndUpdate(
          existingOrder._id,
          { ...orderDetails },
          { new: true } // Return the updated document
        );

        const createPaymentJson = createPaypalPaymentConfig(
          orderDetails.courseTitle,
          orderDetails.courseId,
          orderDetails.coursePricing
        );

        // Create PayPal payment
        return paypal.payment.create(
          createPaymentJson,
          async (error, paymentInfo) => {
            if (error) {
              console.error("PayPal payment creation error:", error);
              return buildErrorResponse(res, "Error creating PayPal payment.");
            }

            // Get approval URL from PayPal to redirect user
            const approveUrl = paymentInfo.links.find(
              (link) => link.rel === "approval_url"
            ).href;

            return buildSuccessResponse(
              res,
              { approveUrl, orderId: updatedOrder._id },
              "Order updated successfully!"
            );
          }
        );
      }
    }

    // No existing order, proceed to create a new one
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

    if (order.paymentStatus === "paid") {
      return buildErrorResponse(
        res,
        "Payment has already been captured for this order."
      );
    }

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
      instructorEmail: order.instructorEmail,
      dateofPurschase: order.orderDate,
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

//get order as invoice  by student id and course id  | GET
orderRouter.get("/invoice/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const order = await Order.find({
      userId: studentId,
      paymentStatus: "paid",
    });

    order.length > 0
      ? buildSuccessResponse(
          res,
          order,
          "all the order list fetched successfuly!!"
        )
      : buildErrorResponse(res, "no order found for this student ");
  } catch (error) {
    console.error("Unexpected error in getInvoice:", error);
    buildErrorResponse(res, "Error fetching order invoice.");
  }
});

// get revenue data for chart  | GET
orderRouter.get("/revenue-data/:instructorId", async (req, res) => {
  try {
    const { instructorId } = req.params;

    const data = await Order.aggregate([
      {
        $match: {
          instructorId: instructorId,
          paymentStatus: "paid",
        },
      },
      {
        $addFields: {
          coursePricing: { $toDouble: "$coursePricing" }, // Convert coursePricing to a number
        },
      },
      {
        $group: {
          _id: {
            orderDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
            },
          },
          totalRevenue: { $sum: "$coursePricing" }, // Sum up coursePricing
        },
      },
      {
        $sort: { "_id.orderDate": 1 },
      },
      {
        $project: {
          _id: 0,
          orderDate: "$_id.orderDate",
          totalRevenue: 1,
        },
      },
    ]);

    data.length > 0
      ? buildSuccessResponse(
          res,
          data,
          "Line chart data for instructor fetched successfully!"
        )
      : buildErrorResponse(res, "No data available for this instructor.");
  } catch (error) {
    console.error("Unexpected error in getLineChartData:", error);
    buildErrorResponse(res, "Error fetching line chart data.");
  }
});

export default orderRouter;
