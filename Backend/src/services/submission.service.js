const Quiz = require("../models/quiz.model");
const Question = require("../models/question.model");
const Submission = require("../models/submission.model");

const isAdmin = (user) => user.role === "admin";
const isTeacher = (user) => user.role === "teacher";
const isStudent = (user) => user.role === "student";
const isOwner = (quiz, user) => quiz.createdBy.toString() === user._id.toString();
const isAssignedStudent = (quiz, user) =>
  quiz.assignedStudents.some((studentId) => studentId.toString() === user._id.toString());

const ensureStudentCanAccessQuiz = async (quizId, user) => {
  if (!isStudent(user)) {
    const err = new Error("Only students can access this action.");
    err.statusCode = 403;
    throw err;
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!quiz.isPublished || !isAssignedStudent(quiz, user)) {
    const err = new Error("You are not allowed to access this quiz.");
    err.statusCode = 403;
    throw err;
  }

  return quiz;
};

const submitQuizService = async (quizId, answers, user) => {
  await ensureStudentCanAccessQuiz(quizId, user);

  const existing = await Submission.findOne({ quiz: quizId, student: user._id })
    .populate("quiz", "title description category isPublished")
    .populate("answers.question", "questionText options points");

  if (existing) {
    return existing;
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    const err = new Error("Answers are required.");
    err.statusCode = 400;
    throw err;
  }

  const questions = await Question.find({ quiz: quizId });
  if (questions.length === 0) {
    const err = new Error("This quiz has no questions.");
    err.statusCode = 400;
    throw err;
  }

  const submittedMap = new Map(answers.map((item) => [String(item.question), item.selectedAnswer]));
  let score = 0;
  let totalPoints = 0;

  const checkedAnswers = questions.map((question) => {
    const selectedAnswer = submittedMap.get(String(question._id));

    if (!selectedAnswer) {
      const err = new Error("All questions must be answered.");
      err.statusCode = 400;
      throw err;
    }

    if (!question.options.includes(selectedAnswer)) {
      const err = new Error("Selected answer must be one of the question options.");
      err.statusCode = 400;
      throw err;
    }

    const points = question.points || 1;
    const isCorrect = selectedAnswer === question.correctAnswer;
    totalPoints += points;
    if (isCorrect) score += points;

    return {
      question: question._id,
      selectedAnswer,
      isCorrect,
    };
  });

  const submission = await Submission.create({
    quiz: quizId,
    student: user._id,
    answers: checkedAnswers,
    score,
    totalPoints,
  });

  return Submission.findById(submission._id)
    .populate("quiz", "title description category isPublished")
    .populate("answers.question", "questionText options points");
};

const getMySubmissionForQuizService = async (quizId, user) => {
  await ensureStudentCanAccessQuiz(quizId, user);

  return Submission.findOne({ quiz: quizId, student: user._id })
    .populate("quiz", "title description category isPublished")
    .populate("answers.question", "questionText options points");
};

const getQuizSubmissionsService = async (quizId, user) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    const err = new Error("Quiz not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && !(isTeacher(user) && isOwner(quiz, user))) {
    const err = new Error("You are not authorized to view submissions for this quiz.");
    err.statusCode = 403;
    throw err;
  }

  return Submission.find({ quiz: quizId })
    .populate("student", "name email role isActive")
    .populate("answers.question", "questionText options correctAnswer points")
    .sort("-createdAt");
};

const getMySubmissionsService = async (user) => {
  if (!isStudent(user)) return [];

  return Submission.find({ student: user._id })
    .populate("quiz", "title description category isPublished")
    .populate("answers.question", "questionText options points")
    .sort("-createdAt");
};

module.exports = {
  submitQuizService,
  getMySubmissionForQuizService,
  getQuizSubmissionsService,
  getMySubmissionsService,
};
