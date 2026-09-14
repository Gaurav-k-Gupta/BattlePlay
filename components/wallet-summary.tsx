"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WalletIcon } from "@/components/icons";

export function WalletSummary({ initialBalance, isLoggedIn }: { initialBalance: string; isLoggedIn: boolean }) {
  const [balance, setBalance] = useState(initialBalance);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn) return;
    
    // Fetch fresh balance on navigation
    fetch("/api/wallet/balance")
      .then(res => res.json())
      .then(data => {
        if (data.balance) {
          setBalance(data.balance);
        }
      })
      .catch(console.error);
  }, [pathname, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <WalletIcon className="size-4" />
        <span>Sign in to view wallet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-violet-700/25 text-violet-400">
        <WalletIcon className="size-4" />
      </span>
      <span className="leading-tight">
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Wallet</span>
        <span className="block text-sm font-bold text-white">₹{balance}</span>
      </span>
    </div>
  );
}
