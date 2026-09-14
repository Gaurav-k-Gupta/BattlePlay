"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function WithdrawalsManager({ initialWithdrawals }: { initialWithdrawals: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const actionWithdrawal = async (id: string, status: string) => {
    let adminNote = "";
    if (status === "REJECTED") {
      const note = prompt("Reason for rejection:");
      if (note === null) return;
      adminNote = note;
    }

    setLoading(id);
    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote })
    });
    setLoading(null);

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update withdrawal.");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-white whitespace-nowrap">
        <thead className="bg-surface text-xs uppercase tracking-wider text-muted border-b border-line">
          <tr>
            <th className="px-4 py-3">Requested At</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">UPI ID</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {initialWithdrawals.map(req => (
            <tr key={req.id} className="hover:bg-white/5 transition">
              <td className="px-4 py-3 text-xs text-muted">
                {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(req.requestedAt))}
              </td>
              <td className="px-4 py-3">
                <div className="font-bold">{req.user.name}</div>
                <div className="text-xs text-muted">{req.user.email}</div>
              </td>
              <td className="px-4 py-3 font-bold text-white">₹{req.amount}</td>
              <td className="px-4 py-3 font-mono text-xs">{req.upiId}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  req.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                  req.status === 'PENDING' ? 'bg-ember-500/20 text-ember-400' :
                  req.status === 'APPROVED' ? 'bg-violet-500/20 text-violet-400' :
                  'bg-white/10 text-muted'
                }`}>
                  {req.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                {req.status === "PENDING" && (
                  <>
                    <button disabled={loading === req.id} onClick={() => actionWithdrawal(req.id, 'APPROVED')} className="text-xs font-bold text-violet-400 hover:text-violet-300">Approve</button>
                    <button disabled={loading === req.id} onClick={() => actionWithdrawal(req.id, 'REJECTED')} className="text-xs font-bold text-ember-400 hover:text-ember-300">Reject</button>
                  </>
                )}
                {req.status === "APPROVED" && (
                  <button disabled={loading === req.id} onClick={() => actionWithdrawal(req.id, 'PAID')} className="text-xs font-bold px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-white">Mark Paid</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {initialWithdrawals.length === 0 && <p className="p-6 text-center text-muted text-sm border-b border-line">No withdrawals found.</p>}
    </div>
  );
}
