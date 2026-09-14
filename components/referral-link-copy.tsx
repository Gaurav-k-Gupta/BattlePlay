"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ReferralLinkCopy({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    setLink(`${window.location.origin}/?ref=${referralCode}`);
  }, [referralCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center w-full max-w-xl">
      <div className="flex-1 w-full p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-sm text-violet-300 truncate">
        {link || "Loading..."}
      </div>
      <Button 
        onClick={handleCopy} 
        disabled={!link}
        className="w-full sm:w-auto h-12 px-8 bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)]"
      >
        {copied ? "Copied!" : "Copy Link"}
      </Button>
    </div>
  );
}
