import { useState, useEffect } from "react";
import QuizList from "./components/QuizList";
import QuizDetail from "./components/QuizDetail";
import QuestionForm from "./components/QuestionForm";
import AuthPage from "./components/AuthPage";
import { tokenStorage, authService, type AuthUser } from "./services/api";

type View = "quizzes" | "quiz-detail" | "add-question";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(tokenStorage.getUser());
  const [currentView, setCurrentView] = useState<View>("quizzes");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const handleAuthSuccess = () => {
    setUser(tokenStorage.getUser());
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentView("quizzes");
    setSelectedQuizId(null);
  };

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentView("quiz-detail");
  };

  const handleAddQuestion = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentView("add-question");
  };

  const handleBack = () => {
    setCurrentView("quizzes");
    setSelectedQuizId(null);
  };

  if (!user) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2.5 text-indigo-400 font-bold text-lg tracking-tight hover:text-indigo-300 transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            Quiz Management
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white leading-none">{user.name}</p>
                <p className="text-xs text-gray-500 leading-none mt-0.5">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {currentView === "quizzes" && (
          <QuizList user={user} onSelectQuiz={handleSelectQuiz} />
        )}
        {currentView === "quiz-detail" && selectedQuizId && (
          <QuizDetail
            quizId={selectedQuizId}
            user={user}
            onBack={handleBack}
            onAddQuestion={() => handleAddQuestion(selectedQuizId)}
          />
        )}
        {currentView === "add-question" && selectedQuizId && (
          <QuestionForm
            quizId={selectedQuizId}
            onSuccess={() => { setCurrentView("quiz-detail"); }}
            onCancel={() => setCurrentView("quiz-detail")}
          />
        )}
      </main>
    </div>
  );
}
