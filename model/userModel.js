//This file talks to database | table

import userSchema from "../Schema/useSchema.js";

// create a user
export const createUser = (userObj) => {
  return userSchema(userObj).save();
};

// get users
export const getUsers = (filter) => {
  return userSchema.find(filter);
};
// update a user
export const updateUser = (filter, updatedUser) => {
  return userSchema.findOneAndUpdate(filter, updatedUser, { new: true });
};

// Find user by email
export const findUserByEmail = (userEmail) => {
  return userSchema.findOne({ userEmail });
};
