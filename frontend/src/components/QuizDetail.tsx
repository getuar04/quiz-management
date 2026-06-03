import { useState, useEffect } from "react";
import { quizService, Question, Quiz, type AuthUser } from "../services/api";

interface QuizDetailProps {
  quizId: string;
  user: AuthUser;
  onBack: () => void;
  onAddQuestion: () => void;
}

export default function QuizDetail({ quizId, user, onBack, onAddQuestion }: QuizDetailProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const quizData = await quizService.getQuizById(quizId);
      setQuiz(quizData);
      const questionsData = await quizService.getQuestionsByQuiz(quizId);
      setQuestions(questionsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await quizService.deleteQuestion(quizId, questionId);
        setQuestions(questions.filter((q) => q.id !== questionId));
      } catch (err) {
        alert("Failed to delete question: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3">
        Error: {error}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3">
        Quiz not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        ← Back to Quizzes
      </button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{quiz.title}</h1>
        <p className="text-gray-400">{quiz.description}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">
            Questions <span className="text-gray-500 font-normal">({questions.length})</span>
          </h2>
          {user.role !== "student" && (
            <button
              onClick={onAddQuestion}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              + Add Question
            </button>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
            No questions yet. Add one to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h3 className="text-gray-100 font-medium pt-0.5">{question.text}</h3>
                  </div>
                  {user.role !== "student" && (
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="flex-shrink-0 w-7 h-7 bg-gray-800 hover:bg-red-900/60 text-gray-500 hover:text-red-300 rounded-full flex items-center justify-center text-xs transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {question.points && (
                  <p className="text-xs text-indigo-400 mb-3 ml-10">Points: {question.points}</p>
                )}

                <div className="ml-10 space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm ${
                        optIndex === question.correctAnswer
                          ? "bg-green-900/30 border-green-700 text-green-300"
                          : "bg-gray-800 border-gray-700 text-gray-300"
                      }`}
                    >
                      <span className="font-bold w-5 text-center">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {optIndex === question.correctAnswer && (
                        <span className="text-green-400 text-xs font-medium">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
