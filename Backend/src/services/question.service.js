const Question = require("../models/question.model");
const Quiz = require("../models/quiz.model");

const isOwner = (quiz, user) => quiz.createdBy.toString() === user._id.toString();
const isAdmin = (user) => user.role === "admin";
const isStudent = (user) => user.role === "student";
const isAssignedStudent = (quiz, user) =>
  quiz.assignedStudents.some((studentId) => studentId.toString() === user._id.toString());

const getQuestionsByQuizService = async (quizId, user) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found.");
    err.statusCode = 404;
    throw err;
  }

  const canAccess =
    isAdmin(user) ||
    isOwner(quiz, user) ||
    (isStudent(user) && quiz.isPublished && isAssignedStudent(quiz, user));

  if (!canAccess) {
    const err = new Error("You are not authorized to access questions for this quiz.");
    err.statusCode = 403;
    throw err;
  }

  return Question.find({ quiz: quizId });
};

const addQuestionService = async (quizId, data, user) => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    const err = new Error("Quiz not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && !isOwner(quiz, user)) {
    const err = new Error("You can only add questions to your own quiz.");
    err.statusCode = 403;
    throw err;
  }

  return Question.create({ ...data, quiz: quizId });
};

const updateQuestionService = async (questionId, data, user) => {
  const question = await Question.findById(questionId).populate("quiz");

  if (!question) {
    const err = new Error("Question not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && question.quiz.createdBy.toString() !== user._id.toString()) {
    const err = new Error("You are not authorized to update this question.");
    err.statusCode = 403;
    throw err;
  }

  if (data.questionText !== undefined) question.questionText = data.questionText;
  if (data.options !== undefined) question.options = data.options;
  if (data.correctAnswer !== undefined) question.correctAnswer = data.correctAnswer;
  if (data.points !== undefined) question.points = data.points;

  return question.save();
};

const deleteQuestionService = async (questionId, user) => {
  const question = await Question.findById(questionId).populate("quiz");

  if (!question) {
    const err = new Error("Question not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && question.quiz.createdBy.toString() !== user._id.toString()) {
    const err = new Error("You are not authorized to delete this question.");
    err.statusCode = 403;
    throw err;
  }

  await question.deleteOne();
};

module.exports = {
  getQuestionsByQuizService,
  addQuestionService,
  updateQuestionService,
  deleteQuestionService,
};
