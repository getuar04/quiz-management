import { useState, useEffect } from "react";
import { quizService, Quiz, type AuthUser } from "../services/api";

interface Props {
  user: AuthUser;
  onSelectQuiz: (quizId: string) => void;
}

export default function QuizList({ user, onSelectQuiz }: Props) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "" });

  useEffect(() => { loadQuizzes(); }, [user.role]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setQuizzes(user.role === "student" ? await quizService.getAllQuizzes() : await quizService.getMyQuizzes());
      setError(null);
    } catch {
      setError("Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const q = await quizService.createQuiz(form);
      setQuizzes((prev) => [q, ...prev]);
      setForm({ title: "", description: "", category: "" });
      setShowForm(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create quiz.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz and all its questions?")) return;
    try {
      await quizService.deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch {
      setError("Failed to delete quiz.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{user.role === "student" ? "Assigned Quizzes" : "My Quizzes"}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} total</p>
        </div>
        {user.role !== "student" && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Quiz
          </button>
        )}
      </div>

      
      {user.role !== "student" && showForm && (
        <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Create New Quiz</h3>
          <input
            type="text"
            placeholder="Quiz title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
          />
          <input
            type="text"
            placeholder="Category (e.g. Programming)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={creating || !form.title.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {creating ? "Creating..." : "Create Quiz"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      
      {quizzes.length === 0 && !showForm ? (
        <div className="text-center py-24 space-y-3">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-400">{user.role === "student" ? "No assigned quizzes yet." : "No quizzes yet. Create your first one!"}</p>
          {user.role !== "student" && (
            <button onClick={() => setShowForm(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
              + New Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="group bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex flex-col gap-4 transition-colors">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white leading-snug">{quiz.title}</h3>
                  {quiz.isPublished && (
                    <span className="shrink-0 text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-full px-2 py-0.5">Live</span>
                  )}
                </div>
                {quiz.description && (
                  <p className="text-gray-400 text-sm line-clamp-2">{quiz.description}</p>
                )}
                {quiz.category && (
                  <span className="inline-block text-xs bg-indigo-400/10 text-indigo-400 rounded-full px-2.5 py-0.5">{quiz.category}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{quiz.questionCount ?? 0} question{quiz.questionCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectQuiz(quiz.id)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Open
                </button>
                {user.role !== "student" && (
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 bg-gray-800 hover:bg-red-900/40 text-gray-500 hover:text-red-400 rounded-xl transition-colors border border-gray-700 hover:border-red-800/50"
                    title="Delete quiz"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
