import { useEffect, useState } from "react";
import AuthPage from "./components/AuthPage";
import QuestionForm from "./components/QuestionForm";
import QuizDetail from "./components/QuizDetail";
import QuizList from "./components/QuizList";
import UserManagement from "./components/UserManagement";
import { authService, tokenStorage, type AuthUser } from "./services/api";

type View = "quizzes" | "quiz-detail" | "add-question" | "users";

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(tokenStorage.getUser());
  const [currentView, setCurrentView] = useState<View>("quizzes");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const handleAuthSuccess = () => setUser(tokenStorage.getUser());

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentView("quizzes");
    setSelectedQuizId(null);
  };

  const handleBack = () => {
    setCurrentView("quizzes");
    setSelectedQuizId(null);
  };

  if (!user) return <AuthPage onSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button onClick={handleBack} className="flex items-center gap-2.5 text-indigo-400 font-bold text-lg hover:text-indigo-300 transition-colors">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">Q</div>
            Quiz Management
          </button>

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <button
                onClick={() => setCurrentView(currentView === "users" ? "quizzes" : "users")}
                className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                {currentView === "users" ? "Quizzes" : "Accounts"}
              </button>
            )}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white leading-none">{user.name}</p>
              <p className="text-xs text-gray-500 leading-none mt-1">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {currentView === "users" && user.role === "admin" && <UserManagement />}
        {currentView === "quizzes" && <QuizList user={user} onSelectQuiz={(id) => { setSelectedQuizId(id); setCurrentView("quiz-detail"); }} />}
        {currentView === "quiz-detail" && selectedQuizId && (
          <QuizDetail quizId={selectedQuizId} user={user} onBack={handleBack} onAddQuestion={() => setCurrentView("add-question")} />
        )}
        {currentView === "add-question" && selectedQuizId && (
          <QuestionForm quizId={selectedQuizId} onSuccess={() => setCurrentView("quiz-detail")} onCancel={() => setCurrentView("quiz-detail")} />
        )}
      </main>
    </div>
  );
}
