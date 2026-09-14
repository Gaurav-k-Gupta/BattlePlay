"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MatchRegister({ matchId, slots, occupied, agreedToTerms = false }: { matchId: string; slots: number; occupied: number[]; agreedToTerms?: boolean }) {
  const router = useRouter(); 
  const [slot, setSlot] = useState<number | null>(null); 
  const [message, setMessage] = useState<string | null>(null); 
  const [pending, setPending] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(agreedToTerms);

  async function register() { 
    if (!slot) return; 
    setPending(true); 

    // If terms are not yet agreed on the server, we must agree to them first
    if (!agreedToTerms && termsAccepted) {
      const termsRes = await fetch("/api/profile/terms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreedToTerms: true })
      });
      if (!termsRes.ok) {
        setPending(false);
        return setMessage("Failed to accept terms. Please try again.");
      }
    }

    const response = await fetch(`/api/matches/${matchId}/register`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ slotNumber: slot }) 
    }); 
    const data = await response.json(); 
    setPending(false); 
    
    if (!response.ok) {
      return setMessage(data.error ?? "Registration failed.");
    }
    
    setMessage("Registered successfully."); 
    router.refresh(); 
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {Array.from({ length: slots }, (_, index) => index + 1).map((number) => { 
          const taken = occupied.includes(number); 
          return (
            <button 
              className={`min-h-11 rounded-lg border text-sm font-bold ${taken ? "cursor-not-allowed border-line bg-elevated text-muted" : slot === number ? "border-violet-400 bg-violet-700/30 text-white" : "border-line bg-canvas text-white hover:border-violet-500"}`} 
              disabled={taken} 
              key={number} 
              onClick={() => setSlot(number)} 
              type="button"
            >
              {taken ? "Taken" : `Team ${number}`}
            </button>
          ); 
        })}
      </div>
      
      {!agreedToTerms && (
        <div className="flex items-center gap-2 mt-4 text-sm text-muted">
          <input 
            type="checkbox" 
            id="terms" 
            checked={termsAccepted} 
            onChange={(e) => setTermsAccepted(e.target.checked)} 
            className="rounded bg-canvas border-line text-violet-500 focus:ring-violet-500"
          />
          <label htmlFor="terms">I accept the <Link href="/terms" className="text-violet-400 hover:underline">Terms & Conditions</Link></label>
        </div>
      )}

      <Button disabled={!slot || pending || (!agreedToTerms && !termsAccepted)} onClick={register} type="button">
        {pending ? "Registering…" : "Register team slot"}
      </Button>
      
      {message ? (
        message === "Accept the terms before registering." ? (
          <p className="text-sm text-violet-400">
            {message} <Link href="/terms" className="underline font-bold text-violet-300">Review Terms</Link>
          </p>
        ) : (
          <p className="text-sm text-violet-400">{message}</p>
        )
      ) : null}
    </div>
  );
}
