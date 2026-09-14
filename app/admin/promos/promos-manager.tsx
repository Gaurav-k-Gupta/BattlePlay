"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PromosManager({ initialPromos }: { initialPromos: any[] }) {
  const router = useRouter();
  const [promos, setPromos] = useState(initialPromos);
  const [isCreating, setIsCreating] = useState(false);
  
  const [code, setCode] = useState("");
  const [bonusAmount, setBonusAmount] = useState(10);
  const [maxRedemptions, setMaxRedemptions] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    const payload: any = { code: code.toUpperCase(), bonusAmount };
    if (maxRedemptions) {
      payload.maxRedemptions = parseInt(maxRedemptions, 10);
    }

    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setIsCreating(false);
    
    if (res.ok) {
      setCode("");
      setBonusAmount(10);
      setMaxRedemptions("");
      router.refresh();
      // Optimistically we'd add it to list, but router.refresh() will do it
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create promo code");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Code</label>
          <input 
            type="text" 
            required 
            value={code} 
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-40 rounded-md bg-canvas border border-line px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
            placeholder="SUMMER26"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Bonus (₹)</label>
          <input 
            type="number" 
            required 
            min="1"
            value={bonusAmount} 
            onChange={(e) => setBonusAmount(parseInt(e.target.value, 10))}
            className="w-24 rounded-md bg-canvas border border-line px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Max Uses</label>
          <input 
            type="number" 
            min="1"
            value={maxRedemptions} 
            onChange={(e) => setMaxRedemptions(e.target.value)}
            className="w-28 rounded-md bg-canvas border border-line px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" 
            placeholder="Unlimited"
          />
        </div>
        <Button type="submit" disabled={isCreating || !code} className="bg-violet-600 hover:bg-violet-500 text-white font-bold h-9">
          {isCreating ? "Creating..." : "Add Code"}
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm text-white whitespace-nowrap">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted border-b border-line">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Bonus</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {promos.map(promo => (
              <tr key={promo.id} className="hover:bg-white/5 transition">
                <td className="px-4 py-3 font-mono font-bold tracking-wider">{promo.code}</td>
                <td className="px-4 py-3 text-green-400 font-bold">₹{promo.bonusAmount}</td>
                <td className="px-4 py-3">
                  {promo.redemptionsCount} / {promo.maxRedemptions ? promo.maxRedemptions : "∞"}
                </td>
                <td className="px-4 py-3">
                  {promo.isActive ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-red-400">Disabled</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(promo.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promos.length === 0 && (
          <p className="p-6 text-center text-muted text-sm border-b border-line">No promo codes found.</p>
        )}
      </div>
    </div>
  );
}
