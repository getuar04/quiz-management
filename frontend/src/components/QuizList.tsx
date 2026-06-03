import { useEffect, useState } from "react";
import { quizService, submissionService, userService, type AuthUser, type Quiz, type UserAccount } from "../services/api";

interface Props {
  user: AuthUser;
  onSelectQuiz: (quizId: string) => void;
}

export default function QuizList({ user, onSelectQuiz }: Props) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<UserAccount[]>([]);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", isPublished: true, assignedStudents: [] as string[] });

  useEffect(() => { loadData(); }, [user.role]);

  const loadData = async () => {
    try {
      setLoading(true);
      setQuizzes(await quizService.getAllQuizzes());
      if (user.role === "student") {
        const mySubmissions = await submissionService.getMySubmissions();
        setCompletedQuizIds(mySubmissions.map((submission) => submission.quiz?.id).filter(Boolean) as string[]);
      }
      if (user.role !== "student") {
        const allUsers = await userService.getUsers();
        setStudents(allUsers.filter((u) => u.role === "student" && u.isActive));
      }
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id: string) => {
    setForm((prev) => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(id)
        ? prev.assignedStudents.filter((studentId) => studentId !== id)
        : [...prev.assignedStudents, id],
    }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      await quizService.createQuiz(form);
      setForm({ title: "", description: "", category: "", isPublished: true, assignedStudents: [] });
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create quiz.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz, questions and submissions?")) return;
    try {
      await quizService.deleteQuiz(id);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete quiz.");
    }
  };

  const togglePublish = async (quiz: Quiz) => {
    try {
      const updated = await quizService.updateQuiz(quiz.id, { isPublished: !quiz.isPublished });
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? { ...q, isPublished: updated.isPublished } : q)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update quiz.");
    }
  };

  if (loading) return <div className="py-24 text-center text-gray-400">Loading quizzes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{user.role === "student" ? "Assigned Quizzes" : user.role === "admin" ? "All Quizzes" : "My Quizzes"}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} total</p>
        </div>
        {user.role !== "student" && (
          <button onClick={() => setShowForm((v) => !v)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
            New Quiz
          </button>
        )}
      </div>

      {user.role !== "student" && showForm && (
        <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Create Quiz</h3>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Quiz title" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white resize-none" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white" />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="accent-indigo-500" />
            Visible for assigned students
          </label>

          <div>
            <p className="text-sm text-gray-300 mb-2">Assign students</p>
            <div className="max-h-40 overflow-y-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-1">
              {students.map((student) => (
                <label key={student.id} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
                  <input type="checkbox" checked={form.assignedStudents.includes(student.id)} onChange={() => toggleStudent(student.id)} className="accent-indigo-500" />
                  {student.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={creating || !form.title.trim()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl">
              {creating ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl">Cancel</button>
          </div>
        </div>
      )}

      {error && <div className="text-red-300 bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {quizzes.length === 0 && !showForm ? (
        <div className="text-center py-24 text-gray-400 bg-gray-900 border border-gray-800 rounded-2xl">
          {user.role === "student" ? "No assigned quizzes yet." : "No quizzes yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white leading-snug">{quiz.title}</h3>
                  <span className={`shrink-0 text-xs rounded-full px-2 py-0.5 ${quiz.isPublished ? "bg-emerald-400/10 text-emerald-400" : "bg-gray-700 text-gray-400"}`}>
                    {quiz.isPublished ? "Visible" : "Hidden"}
                  </span>
                </div>
                {quiz.description && <p className="text-gray-400 text-sm line-clamp-2">{quiz.description}</p>}
                {quiz.category && <span className="inline-block text-xs bg-indigo-400/10 text-indigo-400 rounded-full px-2.5 py-0.5">{quiz.category}</span>}
                <p className="text-xs text-gray-500">{quiz.questionCount ?? 0} questions · {quiz.assignedStudents?.length ?? 0} assigned</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onSelectQuiz(quiz.id)} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
                  {user.role === "student" ? completedQuizIds.includes(quiz.id) ? "Result" : "Start" : "Open"}
                </button>
                {user.role !== "student" && (
                  <>
                    <button onClick={() => togglePublish(quiz)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl">
                      {quiz.isPublished ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => handleDelete(quiz.id)} className="px-3 py-2 bg-gray-800 hover:bg-red-900/40 text-red-300 text-sm rounded-xl">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
