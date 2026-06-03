import { useEffect, useState } from "react";
import { userService, type UserAccount } from "../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "123456", role: "student" as "student" | "teacher" });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await userService.getUsers());
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    try {
      setSaving(true);
      const created = await userService.createUser(form);
      setUsers((prev) => [created, ...prev]);
      setForm({ name: "", email: "", password: "123456", role: "student" });
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (id: string, data: Partial<UserAccount>) => {
    try {
      const updated = await userService.updateUser(id, data);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update user.");
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Account Management</h2>
        <p className="text-sm text-gray-400 mt-1">Admin can create only teachers and students. Admin accounts are created only with script.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 grid md:grid-cols-5 gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white" />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "student" | "teacher" })} className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white">
          <option value="student">student</option>
          <option value="teacher">teacher</option>
        </select>
        <button onClick={createUser} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl px-4 py-2 font-medium">
          {saving ? "Saving..." : "Create"}
        </button>
      </div>

      {error && <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-800">
                <td className="px-4 py-3 text-white">{u.name}</td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? (
                    <span className="text-gray-400">admin</span>
                  ) : (
                    <select value={u.role} onChange={(e) => updateUser(u.id, { role: e.target.value as any })} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white">
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.role === "admin" ? (
                    <span className="text-emerald-400">On</span>
                  ) : (
                    <button onClick={() => updateUser(u.id, { isActive: !u.isActive })} className={`px-3 py-1 rounded-full text-xs font-semibold ${u.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {u.isActive ? "On" : "Off"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
