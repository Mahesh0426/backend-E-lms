import mongoose from "mongoose";
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

//get all submitted assignment | for tutor
export const getAllSubmittedAssignmentList = (assignmentId) => {
  return (
    assignmentSubmissionSchema
      .find({ assignmentId })
      // .find({ assignmentId: new mongoose.Types.ObjectId(assignmentId) })
      .populate({
        path: "studentId",
        select: " userName userEmail",
      })
      .populate({
        path: "assignmentId",
        select: "title description  maxScore",
      })
      .lean()
  ); // Convert to plain JavaScript object
};

//get submitted assignment by id | for student
// export const getSubmittedAssignmentbyId = (id) => {
//   return assignmentSubmissionSchema.findOne({
//     // studentId: new mongoose.Types.ObjectId(id),
//     studentId: id,
//   });
// };

//get submitted assignment by student id | for student
export const getSubmittedAssignmentbyId = async (studentId) => {
  return await assignmentSubmissionSchema.findOne({ studentId });
  // .populate({
  //   path: "assignmentId",
  //   select: "title description courseName dueDate maxScore",
  // })
  // .lean(); // Convert to plain JavaScript object
};

// Find a submission by assignmentId and studentId
export const findSubmissionByIds = (assignmentId, studentId) => {
  return assignmentSubmissionSchema.findOne({
    assignmentId,
    studentId,
  });
};

// Save the submission data after tutor grade them
export const saveSubmission = (submission) => {
  return assignmentSubmissionSchema(submission).save();
};
