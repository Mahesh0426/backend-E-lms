import express from "express";
import { v4 as uuidv4 } from "uuid";
import { createUser, findUserByEmail, updateUser } from "../model/userModel.js";
import { comparePassword, hashPassword } from "../utility/bcryptHelper.js";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../utility/reponseHelper.js";
import { generateJWTs } from "../utility/jwtHelper.js";
import { authMiddleware, refreshAuth } from "../middleware/authMiddleware.js";
import { createSession, deleteSession } from "../model/sessionModel.js";
import { sendResetPasswordLinkEmail } from "../utility/nodemailerHelper.js";

const userRouter = express.Router();

// CREATE USER  |POST | SIGNUP  | PUBLIC Route
userRouter.post("/", async (req, res) => {
  try {
    // Hash password before saving
    const { password } = req.body;

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

// LOGIN USER |POST | LOGIN  | PUBLIC Route
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

// GET the user | PRIVATE ROUTE
userRouter.get("/", authMiddleware, async (req, res) => {
  try {
    buildSuccessResponse(res, req.userInfo, "User Info");
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});

// UPDATE USER | PATCH | PRIVATE
userRouter.patch("/update", authMiddleware, async (req, res) => {
  try {
    // Destructure the _id and other formdata from req.body
    const { _id, ...updatedUser } = req.body;

    // update user in db
    const user = await updateUser({ _id }, updatedUser);

    // Check if the update was successful
    user?._id
      ? buildSuccessResponse(res, user, "User updated successfully")
      : buildErrorResponse(res, "Could not update user");
  } catch (error) {
    console.error("Error updating user:", error);
    buildErrorResponse(res, "Could not update user");
  }
});

// GET NEW ACCESS TOKEN | GET | PRIVATE ROUTE
userRouter.get("/accessjwt", refreshAuth);

//LOGOUT USER | POST | PRIVATE Route
userRouter.post("/logout", authMiddleware, async (req, res) => {
  try {
    const { userEmail } = req.body;
    const { authorization } = req.headers;

    // Remove session for the user
    const result = await deleteSession({
      token: authorization,
      userEmail: userEmail,
    });

    // Use ternary operator to handle success or failure
    result
      ? buildSuccessResponse(res, {}, "Bye, See you again!!")
      : buildErrorResponse(res, "Session not found or already deleted.");
  } catch (error) {
    buildErrorResponse(res, error.message);
  }
});

//FORGET PASSWORD | POST | Public Route
userRouter.post("/forget-password", async (req, res) => {
  try {
    // find if the user exists
    const user = await findUserByEmail(req.body.email);

    if (!user?._id) {
      return buildErrorResponse(res, "User does not exists. Please signup!!");
    }

    if (user?._id) {
      // if user is created send a verification email
      const secureID = uuidv4();

      //   store this secure ID in session storage for that user
      const newUserSession = await createSession({
        userEmail: user.userEmail,
        token: secureID,
      });

      if (newUserSession?._id) {
        // create verification link and send verification email
        const resetUrl = `${process.env.CLIENT_ROOT_URL}/change-password?e=${user.userEmail}&id=${secureID}`;

        // send the email
        sendResetPasswordLinkEmail(user, resetUrl);
      }
    }
    user?._id
      ? buildSuccessResponse(
          res,
          {},
          "Check your inbox/spam to reset your password"
        )
      : buildErrorResponse(res, "Could not send  mail to your inbox");
  } catch (error) {
    console.log(error.message);
    buildErrorResponse(res, error.message);
  }
});

//   CHANGE PASSWORD | PATCH
userRouter.patch("/change-password", async (req, res) => {
  try {
    const { formData, token, userEmail } = req.body;

    // check if the user exists
    const user = await findUserByEmail(userEmail);

    // check if the token exists
    const result = await deleteSession({ token, userEmail });

    if (user && result) {
      const { password } = formData;
      const encryptPassword = hashPassword(password);
      const updatePassword = await updateUser(
        { userEmail: userEmail },
        { password: encryptPassword }
      );
      buildSuccessResponse(
        res,
        updatePassword,
        "Password Reset successfully!!"
      );
    } else {
      buildErrorResponse(res, "Token expired or invalid. Please try again");
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    buildErrorResponse(res, "Can not reset password. Please try again");
  }
});

export default userRouter;
