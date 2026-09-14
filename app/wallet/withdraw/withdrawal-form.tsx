"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function WithdrawalForm({ maxAmount }: { maxAmount: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount < 50) {
      return setError("Minimum withdrawal is ₹50.");
    }
    if (parsedAmount > maxAmount) {
      return setError("Insufficient wallet balance.");
    }
    if (!upiId || upiId.length < 5 || !upiId.includes("@")) {
      return setError("Enter a valid UPI ID (e.g. name@upi).");
    }

    setLoading(true);
    const res = await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parsedAmount, upiId })
    });
    
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      return setError(data.error || "Failed to process withdrawal.");
    }

    setAmount("");
    setUpiId("");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider" htmlFor="amount">Amount (₹)</label>
        <input 
          id="amount" 
          type="number" 
          min="50" 
          step="1"
          placeholder="50" 
          required 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          className="w-full rounded-lg bg-canvas border border-line p-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-muted mb-1 uppercase tracking-wider" htmlFor="upiId">UPI ID</label>
        <input 
          id="upiId" 
          type="text" 
          placeholder="yourname@upi" 
          required 
          value={upiId} 
          onChange={(e) => setUpiId(e.target.value)} 
          className="w-full rounded-lg bg-canvas border border-line p-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      
      {error && <p className="text-sm text-ember-400 font-bold">{error}</p>}
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Processing..." : "Request Withdrawal"}
      </Button>
    </form>
  );
}
