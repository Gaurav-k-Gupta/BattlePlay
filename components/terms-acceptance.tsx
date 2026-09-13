"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function TermsAcceptance({ accepted }: { accepted: boolean }) {
  const [isAccepted, setIsAccepted] = useState(accepted);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function acceptTerms() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile/terms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreedToTerms: true }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(result.error ?? "Unable to record your acceptance.");
        return;
      }

      setIsAccepted(true);
      setMessage("Terms accepted. You can now register for eligible matches.");
    } catch {
      setMessage("Unable to reach the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isAccepted) {
    return <p className="rounded-xl border border-violet-500/40 bg-violet-700/15 p-4 text-violet-400">You have accepted the BattlePlay terms.</p>;
  }

  return (
    <div className="space-y-4">
      <Button
        disabled={isSaving}
        onClick={acceptTerms}
        type="button"
      >
        {isSaving ? "Recording…" : "I accept the terms"}
      </Button>
      {message ? <p aria-live="polite" className="text-sm font-medium text-violet-400">{message}</p> : null}
    </div>
  );
}
