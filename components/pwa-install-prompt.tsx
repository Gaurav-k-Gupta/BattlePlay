"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default to true so it doesn't flash before checking

  useEffect(() => {
    // Check if already installed
    const isPwa = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(!!isPwa);

    if (isPwa) return;

    // Listen for standard PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect iOS for manual install instructions
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // If already installed or no prompt available (and not iOS), don't render anything
  if (isStandalone) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <Card className="mt-8 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-violet-500/30 bg-violet-900/10" tone="elevated">
      <div className="flex items-center gap-4">
        <div className="hidden sm:grid size-12 shrink-0 place-items-center rounded-xl bg-violet-600 font-display text-xl font-black text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]">
          B
        </div>
        <div>
          <h3 className="font-display text-lg font-black text-white uppercase tracking-wide">Install BattlePlay</h3>
          <p className="text-sm text-muted mt-1">Get the native app experience on your device.</p>
        </div>
      </div>

      {deferredPrompt ? (
        <Button 
          onClick={handleInstallClick}
          className="w-full sm:w-auto px-8 bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)]"
        >
          Install App
        </Button>
      ) : isIOS ? (
        <div className="text-xs text-muted font-medium bg-black/40 p-3 rounded-lg border border-white/5">
          Tap <span className="font-bold text-white px-1">Share</span> then <span className="font-bold text-white px-1">Add to Home Screen</span>
        </div>
      ) : null}
    </Card>
  );
}
