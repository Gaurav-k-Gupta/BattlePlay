"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UsersManager({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const toggleBan = async (id: string) => {
    setLoading(id);
    const res = await fetch(`/api/admin/users/${id}/ban`, {
      method: "POST"
    });
    setLoading(null);

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update user.");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-white whitespace-nowrap">
        <thead className="bg-surface text-xs uppercase tracking-wider text-muted border-b border-line">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">FF IGN</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {initialUsers.map(u => (
            <tr key={u.id} className="hover:bg-white/5 transition">
              <td className="px-4 py-3 font-bold">{u.name}</td>
              <td className="px-4 py-3 text-xs text-muted">{u.email}</td>
              <td className="px-4 py-3 font-mono text-xs text-violet-400">{u.role}</td>
              <td className="px-4 py-3 font-mono text-xs">{u.freeFireIGN || "-"}</td>
              <td className="px-4 py-3 text-xs text-muted">
                {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(u.createdAt))}
              </td>
              <td className="px-4 py-3">
                {u.isBanned ? (
                  <span className="px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-ember-500/20 text-ember-400">Banned</span>
                ) : (
                  <span className="px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-green-500/20 text-green-400">Active</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <button 
                  disabled={loading === u.id || u.role === "ADMIN"} 
                  onClick={() => toggleBan(u.id)} 
                  className={`text-xs font-bold px-3 py-1.5 rounded disabled:opacity-50 ${u.isBanned ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-ember-600 hover:bg-ember-500 text-white'}`}
                >
                  {u.isBanned ? "Unban" : "Ban"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {initialUsers.length === 0 && <p className="p-6 text-center text-muted text-sm border-b border-line">No users found.</p>}
    </div>
  );
}
