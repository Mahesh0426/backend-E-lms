import quizSchema from "../../Schema/quiz/quizSchema.js";

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

// find quiz by quizID and courseID
export const getQuizByCourseId = (courseId) => {
  return quizSchema.find({ courseId });
};
