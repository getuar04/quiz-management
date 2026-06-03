const {
  submitQuizService,
  getMySubmissionForQuizService,
  getQuizSubmissionsService,
  getMySubmissionsService,
} = require("../services/submission.service");
const { sendSuccess, sendError } = require("../utils/response.util");

const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!answers) {
      return sendError(res, 400, "Answers are required.");
    }

    const submission = await submitQuizService(req.params.quizId, answers, req.user);
    return sendSuccess(res, 200, "Quiz submitted successfully.", submission);
  } catch (error) {
    next(error);
  }
};

const getMySubmissionForQuiz = async (req, res, next) => {
  try {
    const submission = await getMySubmissionForQuizService(req.params.quizId, req.user);
    return sendSuccess(res, 200, "Submission retrieved.", submission);
  } catch (error) {
    next(error);
  }
};

const getQuizSubmissions = async (req, res, next) => {
  try {
    const submissions = await getQuizSubmissionsService(req.params.quizId, req.user);
    return sendSuccess(res, 200, "Submissions retrieved.", submissions);
  } catch (error) {
    next(error);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await getMySubmissionsService(req.user);
    return sendSuccess(res, 200, "Your submissions retrieved.", submissions);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitQuiz, getMySubmissionForQuiz, getQuizSubmissions, getMySubmissions };
