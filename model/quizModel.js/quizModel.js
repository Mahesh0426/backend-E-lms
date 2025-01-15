import mongoose from "mongoose";
import quizSchema from "../../Schema/quiz/quizSchema.js";
import quizSubmissionSchema from "../../Schema/quiz/quizSubmissionSchema.js";

// CREATE A Quiz
export const createQuiz = (quizObj) => {
  return quizSchema(quizObj).save();
};

// update quiz by id
export const updateQuiz = (_id, updatedObject) => {
  return quizSchema.findByIdAndUpdate(_id, updatedObject, { new: true });
};

//delete quiz bi id
export const deleteQuiz = (_id) => {
  return quizSchema.findByIdAndDelete(_id);
};

// find all quizes
export const getAllQuizesList = (instructorId) => {
  return quizSchema.find({ instructorId });
};

// update a quiz status by ID
export const updateQuizStatus = (quizId, status) => {
  return quizSchema.findByIdAndUpdate(quizId, { status }, { new: true });
};

// find quiz by courseID
export const getQuizByCourseId = (courseId) => {
  return quizSchema.find({ courseId });
};

//QUIZ SUBMITSSION Model / USER
// submitQuiz quiz by student
export const submitQuiz = (answerObj) => {
  return quizSubmissionSchema(answerObj).save();
};

//get submitted quiz by student Id
export const getSubmittedQuiz = (quizId, studentId) => {
  return quizSubmissionSchema
    .findOne({
      quizId,
      studentId: new mongoose.Types.ObjectId(studentId),
    })
    .lean();
};

//get all submitted quiz by quizId | for tutor
export const getallSubmittedQuiz = (quizId) => {
  return quizSubmissionSchema
    .find({ quizId })
    .populate({
      path: "studentId",
      select: "userEmail",
    })
    .populate({
      path: "quizId",
      select: "title ",
    });
};
