const {
  getAllQuizzesService,
  getMyQuizzesService,
  getQuizByIdService,
  createQuizService,
  updateQuizService,
  deleteQuizService,
} = require("../services/quiz.service");
const { sendSuccess, sendError } = require("../utils/response.util");

const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await getAllQuizzesService(req.user);
    return sendSuccess(res, 200, "Quizzes retrieved.", quizzes);
  } catch (error) {
    next(error);
  }
};

const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await getMyQuizzesService(req.user._id);
    return sendSuccess(res, 200, "Your quizzes retrieved.", quizzes);
  } catch (error) {
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const quiz = await getQuizByIdService(req.params.id, req.user);
    return sendSuccess(res, 200, "Quiz retrieved.", quiz);
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const { title, description, category, isPublished, assignedStudents } = req.body;

    if (!title) {
      return sendError(res, 400, "Title is required.");
    }

    const quiz = await createQuizService({ title, description, category, isPublished, assignedStudents }, req.user._id);
    return sendSuccess(res, 201, "Quiz created.", quiz);
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await updateQuizService(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, "Quiz updated.", quiz);
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    await deleteQuizService(req.params.id, req.user);
    return sendSuccess(res, 200, "Quiz deleted.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  getMyQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
