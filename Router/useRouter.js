import express from "express";
import { createUser, findUserByEmail } from "../model/userModel.js";
import { comparePassword, hashPassword } from "../utility/bcryptHelper.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/reponseHelper.js";
import { generateJWTs } from "../utility/jwtHelper.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// CREATE USER  |POST | SIGNUP  | Public Route
userRouter.post("/", async (req, res) => {
  try {
    // Hash password before saving
    const { password } = req.body;
    console.log("req.body", req.body);

    const hashedPassword = hashPassword(password);

    // query to th db
    const result = await createUser({ ...req.body, password: hashedPassword });

    // check result  has id property
    result?._id
      ? buildSuccessResponse(res, result, "User created Successfully!!")
      : buildErrorResponse(res, "Couldn't create user!!");
  } catch (error) {
    console.error("Error during user registration:", error);
    if (error.code == 11000) {
      error.message = "User with this Email already exists!!";
    }
    buildErrorResponse(res, error.message);
  }
});

// LOGIN USER |POST | LOGIN  | Public Route
userRouter.post("/login", async (req, res) => {
  try {
    const { userEmail, password } = req.body;

    // Find user by email in db
    const user = await findUserByEmail(userEmail);

    // return error if user is not found or user is not verified
    if (!user?._id) {
      return buildErrorResponse(res, "User account does not exist!");
    }

    //   if (!user?.isVerified) {
    //     return buildErrorResponse(res, "User is not verified");
    //   }

    // Compare password
    const isPasswordMatched = comparePassword(password, user.password);

    // Generate and send back tokens
    if (isPasswordMatched) {
      const jwt = await generateJWTs(user.userEmail);

      return buildSuccessResponse(res, jwt, "Logged in Successfully");
    }
    return buildErrorResponse(res, "Invalid Credentials");
  } catch (error) {
    console.log(error);

    buildErrorResponse(res, "Invalid Credentials");
  }
});

// PRIVATE ROUTES | get the user
userRouter.get("/", authMiddleware, async (req, res) => {
  try {
    buildSuccessResponse(res, req.userInfo, "User Info");
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});
export default userRouter;
