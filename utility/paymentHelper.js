import MyCourses from "../Schema/myCoursesSchema.js";

// Helper function to create PayPal payment JSON configuration
export const createPaypalPaymentConfig = (
  courseTitle,
  courseId,
  coursePricing
) => ({
  intent: "sale",
  payer: { payment_method: "paypal" },
  redirect_urls: {
    return_url: `${process.env.CLIENT_ROOT_URL}/payment-return`,
    cancel_url: `${process.env.CLIENT_ROOT_URL}/payment-cancel`,
  },
  transactions: [
    {
      item_list: {
        items: [
          {
            name: courseTitle,
            sku: courseId,
            price: coursePricing,
            currency: "AUD",
            quantity: 1,
          },
        ],
      },
      amount: { currency: "AUD", total: coursePricing.toFixed(2) },
      description: courseTitle,
    },
  ],
});
// Helper function to add a course to student’s purchased courses record
export const addCourseToStudent = async (userId, courseDetails) => {
  const studentCourses = await MyCourses.findOne({ userId });
  if (studentCourses) {
    studentCourses.courses.push(courseDetails);
    await studentCourses.save();
  } else {
    const newStudentCourses = new MyCourses({
      userId,
      courses: [courseDetails],
    });
    await newStudentCourses.save();
  }
};
