import assignmentSchema from "../../Schema/assessmentSchema/assessmentSchema.js";
// CREATE A Assignment
export const createAssignment = (assignmentObj) => {
  return assignmentSchema(assignmentObj).save();
};

// find all Assignment
export const getAllAssignmentList = (filter) => {
  return assignmentSchema.find(filter);
};

// update a assignment status by ID
export const updateAssignmentStatus = (assignmentId, status) => {
  return assignmentSchema.findByIdAndUpdate(
    assignmentId,
    { status },
    { new: true }
  );
};

// find assignment by courseID
export const getAssignmentByCourseId = (courseId) => {
  return assignmentSchema.find({ courseId });
};
