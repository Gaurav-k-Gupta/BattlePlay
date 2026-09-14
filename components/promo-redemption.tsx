"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PromoRedemption() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/promo/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase() })
    });

    setLoading(false);
    const data = await res.json();

    if (res.ok) {
      setCode("");
      setMessage({ type: "success", text: data.message });
      router.refresh();
    } else {
      setMessage({ type: "error", text: data.error || "Failed to redeem code" });
    }
  };

  return (
    <Card className="p-6" tone="elevated">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-violet-400">PROMO CODE</p>
        <h2 className="mt-2 font-display text-xl font-black text-white">Redeem a bonus</h2>
      </div>
      
      <form onSubmit={handleRedeem} className="mt-5 space-y-4">
        <input
          type="text"
          placeholder="Enter promo code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full rounded-xl border border-line bg-canvas p-4 text-center text-sm font-bold tracking-widest text-white placeholder:text-muted focus:border-violet-500 focus:outline-none"
        />
        
        {message && (
          <p className={`text-sm font-bold text-center ${message.type === "success" ? "text-green-400" : "text-ember-400"}`}>
            {message.text}
          </p>
        )}
        
        <Button 
          type="submit" 
          disabled={loading || !code} 
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold h-12"
        >
          {loading ? "Verifying..." : "Redeem Code"}
        </Button>
      </form>
    </Card>
  );
}
