import assignmentSchema from "../../Schema/assessmentSchema/assessmentSchema.js";
import assignmentSubmissionSchema from "../../Schema/assessmentSchema/assignmentSubmissionSchema.js";
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

//ASSIGNMENT SUBMITSSION model

//create a assignment subbmission
export const createAssignmentSubmission = (submissionObj) => {
  return assignmentSubmissionSchema(submissionObj).save();
};

//get all submitted assignment
export const getAllSubmittedAssignmentList = (assignmentId) => {
  return assignmentSubmissionSchema
    .find({ assignmentId })
    .populate("studentId", "userName userEmail")
    .exec();
};

//get submitted assignment by id
export const getSubmittedAssignmentbyId = (id) => {
  return assignmentSubmissionSchema.findOne({ studentId: id });
};
