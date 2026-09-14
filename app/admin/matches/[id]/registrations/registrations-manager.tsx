"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RegistrationsManager({ match, initialRegistrations }: { match: any, initialRegistrations: any[] }) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [loading, setLoading] = useState<string | null>(null);
  const [crediting, setCrediting] = useState(false);

  const updateRegistration = async (regId: string, updates: any) => {
    setLoading(regId);
    const res = await fetch(`/api/admin/matches/${match.id}/registrations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: regId, ...updates })
    });
    setLoading(null);
    if (res.ok) {
      setRegistrations(registrations.map(r => r.id === regId ? { ...r, ...updates } : r));
      router.refresh();
    } else {
      alert("Failed to update registration");
    }
  };

  const handleCreditWinnings = async () => {
    if (!confirm("Are you sure? This will credit winnings to all users with placements and cannot be easily undone.")) return;
    setCrediting(true);
    const res = await fetch(`/api/admin/matches/${match.id}/winnings`, {
      method: "POST"
    });
    setCrediting(false);
    
    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      router.refresh();
    } else {
      alert(result.error || "Failed to credit winnings");
    }
  };

  const calculateProjectedPrize = (placement: number | null, finishes: number = 0) => {
    let prize = 0;
    if (placement === 1) prize += match.winnerPrize;
    if (placement === 2) prize += match.runnerUpPrize;
    if (finishes > 0 && match.prizePerFinish) prize += (finishes * match.prizePerFinish);
    return prize;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleCreditWinnings} disabled={crediting} className="bg-green-600 hover:bg-green-500 text-white">
          {crediting ? "Processing..." : "Credit Winnings"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white whitespace-nowrap">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted border-b border-line">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">FF IGN</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Verified by Host</th>
              <th className="px-4 py-3">Placement</th>
              <th className="px-4 py-3">Finishes</th>
              <th className="px-4 py-3">Projected Winnings</th>
              <th className="px-4 py-3">Winnings Credited</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {registrations.map(reg => {
              const projected = calculateProjectedPrize(reg.placement, reg.finishes);
              return (
                <tr key={reg.id} className="hover:bg-white/5 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold">{reg.user.name}</div>
                    <div className="text-xs text-muted">{reg.user.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{reg.freeFireIGNUsed}</td>
                  <td className="px-4 py-3">{reg.slotNumber}</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={reg.verifiedByHost} 
                        disabled={loading === reg.id}
                        onChange={(e) => updateRegistration(reg.id, { verifiedByHost: e.target.checked, placement: reg.placement })}
                        className="rounded border-line bg-canvas text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-xs">Verified</span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      min="1"
                      defaultValue={reg.placement || ""}
                      disabled={loading === reg.id || reg.winningsCredited}
                      onBlur={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : null;
                        if (val !== reg.placement) {
                          updateRegistration(reg.id, { verifiedByHost: reg.verifiedByHost, placement: val, finishes: reg.finishes });
                        }
                      }}
                      className="w-16 rounded-md bg-canvas border border-line px-2 py-1 text-sm text-white focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      min="0"
                      defaultValue={reg.finishes || 0}
                      disabled={loading === reg.id || reg.winningsCredited}
                      onBlur={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : 0;
                        if (val !== reg.finishes) {
                          updateRegistration(reg.id, { verifiedByHost: reg.verifiedByHost, placement: reg.placement, finishes: val });
                        }
                      }}
                      className="w-16 rounded-md bg-canvas border border-line px-2 py-1 text-sm text-white focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {projected > 0 ? (
                      <span className="text-green-400 font-bold">₹{projected.toFixed(0)}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {reg.winningsCredited ? (
                      <span className="px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-green-500/20 text-green-400">Yes</span>
                    ) : (
                      <span className="px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-white/10 text-muted">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {registrations.length === 0 && <p className="p-6 text-center text-muted text-sm border-b border-line">No registrations for this match yet.</p>}
      </div>
    </div>
  );
}
