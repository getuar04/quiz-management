import { useEffect, useState } from "react";
import { quizService, submissionService, type AuthUser, type Question, type Quiz, type Submission } from "../services/api";

interface QuizDetailProps {
  quizId: string;
  user: AuthUser;
  onBack: () => void;
  onAddQuestion: () => void;
}

export default function QuizDetail({ quizId, user, onBack, onAddQuestion }: QuizDetailProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadQuizData(); }, [quizId]);

  const fillAnswersFromSubmission = (submission: Submission | null) => {
    if (!submission?.answers) return;
    const savedAnswers: Record<string, string> = {};
    submission.answers.forEach((answer) => {
      if (answer.question?.id) savedAnswers[answer.question.id] = answer.selectedAnswer;
    });
    setAnswers(savedAnswers);
  };

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const quizData = await quizService.getQuizById(quizId);
      const questionsData = await quizService.getQuestionsByQuiz(quizId);
      setQuiz(quizData);
      setQuestions(questionsData);

      if (user.role === "student") {
        const existingSubmission = await submissionService.getMySubmissionForQuiz(quizId);
        setResult(existingSubmission);
        fillAnswersFromSubmission(existingSubmission);
      } else {
        setSubmissions(await submissionService.getQuizSubmissions(quizId));
      }

      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load quiz data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await quizService.deleteQuestion(quizId, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete question.");
    }
  };

  const handleSubmit = async () => {
    if (result) return;

    if (questions.some((q) => !answers[q.id])) {
      setError("Answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = questions.map((q) => ({ question: q.id, selectedAnswer: answers[q.id] }));
      const submission = await submissionService.submitQuiz(quizId, payload);
      setResult(submission);
      fillAnswersFromSubmission(submission);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading quiz...</div>;
  if (error && !quiz) return <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3">{error}</div>;
  if (!quiz) return <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3">Quiz not found</div>;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">← Back to Quizzes</button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">{quiz.title}</h1>
            <p className="text-gray-400">{quiz.description}</p>
            <p className="text-xs text-gray-500 mt-3">{quiz.category || "General"} · {quiz.isPublished ? "Visible" : "Hidden"}</p>
          </div>
          {user.role !== "student" && (
            <button onClick={onAddQuestion} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              Add Question
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {result && (
        <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-300 rounded-xl px-4 py-3">
          This quiz is completed. Score: {result.score}/{result.totalPoints}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">Questions <span className="text-gray-500 font-normal">({questions.length})</span></h2>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">No questions yet.</div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{index + 1}</span>
                    <h3 className="text-gray-100 font-medium pt-0.5">{question.text}</h3>
                  </div>
                  {user.role !== "student" && (
                    <button onClick={() => handleDeleteQuestion(question.id)} className="w-7 h-7 bg-gray-800 hover:bg-red-900/60 text-gray-500 hover:text-red-300 rounded-full text-xs transition-colors">✕</button>
                  )}
                </div>

                <p className="text-xs text-indigo-400 mb-3 ml-10">Points: {question.points || 1}</p>

                <div className="ml-10 space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isCorrect = user.role !== "student" && question.correctAnswer === optIndex;
                    const isSelected = answers[question.id] === option;
                    return (
                      <label key={optIndex} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm ${isCorrect ? "bg-green-900/30 border-green-700 text-green-300" : isSelected ? "bg-indigo-900/30 border-indigo-700 text-indigo-300" : "bg-gray-800 border-gray-700 text-gray-300"}`}>
                        {user.role === "student" && !result && (
                          <input type="radio" name={question.id} checked={isSelected} onChange={() => setAnswers({ ...answers, [question.id]: option })} className="accent-indigo-500" />
                        )}
                        <span className="font-bold w-5 text-center">{String.fromCharCode(65 + optIndex)}</span>
                        <span className="flex-1">{option}</span>
                        {isSelected && user.role === "student" && result && <span className="text-indigo-300 text-xs font-medium">Your answer</span>}
                        {isCorrect && <span className="text-green-400 text-xs font-medium">Correct</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {user.role === "student" && questions.length > 0 && !result && (
          <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl">
            {submitting ? "Submitting..." : "Submit Answers"}
          </button>
        )}
      </div>

      {user.role !== "student" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-100">Student Submissions</h2>
          {submissions.length === 0 ? (
            <div className="text-gray-500 bg-gray-900 border border-gray-800 rounded-xl p-5">No submissions yet.</div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="text-left px-4 py-3">Student</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-t border-gray-800">
                      <td className="px-4 py-3 text-white">{s.student?.name}</td>
                      <td className="px-4 py-3 text-gray-400">{s.student?.email}</td>
                      <td className="px-4 py-3 text-indigo-300">{s.score}/{s.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
