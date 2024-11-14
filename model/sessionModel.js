import sessionSchema from "../Schema/sessionSchema.js";

//read @filter must be an object
export const getSession = (filter) => {
  return sessionSchema.findOne(filter);
};

//Create
export const createSession = (sessionObj) => {
  return sessionSchema(sessionObj).save();
};

//delete
export const deleteSession = (filter) => {
  return sessionSchema.findOneAndDelete(filter);
};
