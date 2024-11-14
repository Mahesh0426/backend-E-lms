import jwt from "jsonwebtoken";
import { createSession } from "../model/sessionModel.js";

// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

// access jwt: session table, exp:15min
export const generateAccessJWT = async (email) => {
  const token = jwt.sign({ email }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
  await createSession({ token, userEmail: email });

  return token;
};

// refresh jwt: session table, exp:30d
export const generateRefreshJWT = async (email) => {
  try {
    const token = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });

    return token;
  } catch (error) {
    console.log(error);
  }
};

// generate tokens
export const generateJWTs = async (email) => {
  return {
    accessJWT: await generateAccessJWT(email),
    refreshJWT: await generateRefreshJWT(email),
  };
};

// verify access token and return decoded email
export const verifyAccessJWT = (accessJWT) => {
  return jwt.verify(accessJWT, process.env.JWT_ACCESS_SECRET);
};

// verify refresh token and return decoded email
export const verifyRefreshJWT = (refreshJWT) => {
  return jwt.verify(refreshJWT, process.env.JWT_REFRESH_SECRET);
};
