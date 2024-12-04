import quizSchema from "../../Schema/quiz/quizSchema.js";
import quizSubmissionSchema from "../../Schema/quiz/quizSubmissionSchema.js";

// CREATE A Quiz
export const createQuiz = (quizObj) => {
  return quizSchema(quizObj).save();
};

// find all quizes
export const getAllQuizesList = (filter) => {
  return quizSchema.find(filter);
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
export const getSubmittedQuiz = (studentId, quizSubmissionId) => {
  return quizSubmissionSchema.findOne({
    _id: quizSubmissionId,
    studentId: studentId,
  });
};

//get all submitted quiz by quizId | for tutor
export const getallSubmittedQuiz = (quizId) => {
  return quizSubmissionSchema.find({ quizId });
};
