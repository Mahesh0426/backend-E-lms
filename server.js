import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectToMongoDb } from "./config/dbConfig.js";
import userRouter from "./Router/useRouter.js";
import uploadRouter from "./Router/uploadRouter.js";
import courseRouter from "./Router/courseRouter.js";

import courseProgressRouter from "./Router/studentRouter/courseProgressRouter.js";
import myCourseRouter from "./Router/studentRouter/myCoursesRouter.js";
import orderRouter from "./Router/studentRouter/orderRouter.js";
import studentCourseRouter from "./Router/studentRouter/studentCourseRouter.js";
import quizRouter from "./Router/quizRouter/quizRouter.js";
import assignmmentRouter from "./Router/assignmentRouter/assignmentRouter.js";
import marksRouter from "./Router/marksRouter/marksRouter.js";

const app = express();
const PORT = process.env.PORT || 8000;

// CORS options
const corsOptions = {
  // origin: process.env.CLIENT_ROOT_URL,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Authorization",
  ],
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Middleware to parse JSON request bodies
app.use(express.json());

// check  route
app.get("/", (req, res) => {
  res.send(" hello node JS");
});

// connect to mongo
connectToMongoDb();

//routes
app.use("/api/user", userRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/course", courseRouter);
app.use("/api/studentCourse", studentCourseRouter);
app.use("/api/order", orderRouter);
app.use("/api/student/my-courses", myCourseRouter);
app.use("/api/student/course-progress", courseProgressRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/assignment", assignmmentRouter);
app.use("/api/marks", marksRouter);

// start server
app.listen(PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`server is running at  'http://localhost:${PORT}'`);
});
