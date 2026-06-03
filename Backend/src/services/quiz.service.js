const Quiz = require("../models/quiz.model");
const Question = require("../models/question.model");
const Submission = require("../models/submission.model");
const User = require("../models/user.model");

const isOwner = (quiz, user) => quiz.createdBy.toString() === user._id.toString();
const isAdmin = (user) => user.role === "admin";
const isTeacher = (user) => user.role === "teacher";
const isStudent = (user) => user.role === "student";
const isAssignedStudent = (quiz, user) =>
  quiz.assignedStudents.some((studentId) => studentId.toString() === user._id.toString());

const validateAssignedStudents = async (ids = []) => {
  if (!Array.isArray(ids)) {
    const err = new Error("assignedStudents must be an array.");
    err.statusCode = 400;
    throw err;
  }

  if (ids.length === 0) return [];

  const students = await User.find({ _id: { $in: ids }, role: "student", isActive: true }).select("_id");

  if (students.length !== ids.length) {
    const err = new Error("assignedStudents can contain only active student users.");
    err.statusCode = 400;
    throw err;
  }

  return ids;
};

const getAllQuizzesService = async (user) => {
  if (isTeacher(user)) {
    return Quiz.find({ createdBy: user._id })
      .populate("createdBy", "name email role isActive")
      .populate("assignedStudents", "name email role isActive")
      .populate("questions")
      .sort("-createdAt");
  }

  if (isAdmin(user)) {
    return Quiz.find()
      .populate("createdBy", "name email role isActive")
      .populate("assignedStudents", "name email role isActive")
      .populate("questions")
      .sort("-createdAt");
  }

  return Quiz.find({
    isPublished: true,
    assignedStudents: user._id,
  })
    .populate("createdBy", "name email role isActive")
    .sort("-createdAt");
};

const getMyQuizzesService = async (userId) => {
  return Quiz.find({ createdBy: userId })
    .populate("assignedStudents", "name email role isActive")
    .populate("questions")
    .sort("-createdAt");
};

const getQuizByIdService = async (quizId, user) => {
  const rawQuiz = await Quiz.findById(quizId);

  if (!rawQuiz) {
    const err = new Error("Quiz not found.");
    err.statusCode = 404;
    throw err;
  }

  const canAccess =
    isAdmin(user) ||
    (isTeacher(user) && isOwner(rawQuiz, user)) ||
    (isStudent(user) && rawQuiz.isPublished && isAssignedStudent(rawQuiz, user));

  if (!canAccess) {
    const err = new Error("You are not authorized to access this quiz.");
    err.statusCode = 403;
    throw err;
  }

  const query = Quiz.findById(quizId)
    .populate("createdBy", "name email role isActive")
    .populate("assignedStudents", "name email role isActive");

  if (!isStudent(user)) query.populate("questions");

  return query;
};

const createQuizService = async (data, userId) => {
  const assignedStudents = await validateAssignedStudents(data.assignedStudents || []);

  return Quiz.create({
    title: data.title,
    description: data.description,
    category: data.category,
    isPublished: Boolean(data.isPublished),
    assignedStudents,
    createdBy: userId,
  });
};

const updateQuizService = async (quizId, data, user) => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    const err = new Error("Quiz not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && !isOwner(quiz, user)) {
    const err = new Error("You are not authorized to update this quiz.");
    err.statusCode = 403;
    throw err;
  }

  if (data.title !== undefined) quiz.title = data.title;
  if (data.description !== undefined) quiz.description = data.description;
  if (data.category !== undefined) quiz.category = data.category;
  if (data.isPublished !== undefined) quiz.isPublished = data.isPublished;
  if (data.assignedStudents !== undefined) quiz.assignedStudents = await validateAssignedStudents(data.assignedStudents);

  return quiz.save();
};

const deleteQuizService = async (quizId, user) => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    const err = new Error("Quiz not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && !isOwner(quiz, user)) {
    const err = new Error("You are not authorized to delete this quiz.");
    err.statusCode = 403;
    throw err;
  }

  await Question.deleteMany({ quiz: quizId });
  await Submission.deleteMany({ quiz: quizId });
  await quiz.deleteOne();
};

module.exports = {
  getAllQuizzesService,
  getMyQuizzesService,
  getQuizByIdService,
  createQuizService,
  updateQuizService,
  deleteQuizService,
};
