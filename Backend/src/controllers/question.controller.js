const {
  getQuestionsByQuizService,
  addQuestionService,
  updateQuestionService,
  deleteQuestionService,
} = require("../services/question.service");
const { sendSuccess, sendError } = require("../utils/response.util");

const getQuestionsByQuiz = async (req, res, next) => {
  try {
    const questions = await getQuestionsByQuizService(req.params.quizId, req.user);
    return sendSuccess(res, 200, "Questions retrieved.", questions);
  } catch (error) {
    next(error);
  }
};

const addQuestion = async (req, res, next) => {
  try {
    const { questionText, options, correctAnswer, points } = req.body;

    if (!questionText || !options || !correctAnswer) {
      return sendError(res, 400, "questionText, options, and correctAnswer are required.");
    }

    const question = await addQuestionService(
      req.params.quizId,
      { questionText, options, correctAnswer, points },
      req.user
    );
    return sendSuccess(res, 201, "Question added.", question);
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await updateQuestionService(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, "Question updated.", question);
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    await deleteQuestionService(req.params.id, req.user);
    return sendSuccess(res, 200, "Question deleted.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuestionsByQuiz, addQuestion, updateQuestion, deleteQuestion };
