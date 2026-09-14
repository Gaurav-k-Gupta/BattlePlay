import Link from "next/link";
import { Suspense } from "react";

import { AppNavigation } from "@/components/app-navigation";
import { WalletIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getWalletBalance } from "@/lib/wallet-balance";
import { WalletSummary } from "@/components/wallet-summary";
import { NotificationBell } from "@/components/notification-bell";

async function WalletSummaryWrapper() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <WalletIcon className="size-4" />
        <span>Sign in to view wallet</span>
      </div>
    );
  }

  const balance = await getWalletBalance(user.id);

  return <WalletSummary initialBalance={balance.toFixed(2)} isLoggedIn={true} />;
}

function WalletSummaryFallback() {
  return <div className="h-9 w-28 animate-pulse rounded-lg bg-elevated" />;
}

export async function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-surface/95 p-5 lg:flex lg:flex-col">
        <Link className="flex items-center gap-3 px-3 py-3" href={isAdmin ? "/admin" : "/"}>
          <span className="grid size-10 place-items-center rounded-xl bg-violet-600 font-display text-lg font-black text-white shadow-[0_0_24px_rgb(112_77_255_/_0.4)]">B</span>
          <span><span className="block font-display text-xl font-black tracking-tight text-white">BattlePlay</span><span className="block text-xs font-semibold uppercase tracking-[0.17em] text-violet-400">Esports arena</span></span>
        </Link>
        <div className="mt-8"><AppNavigation variant="sidebar" isAdmin={isAdmin} /></div>
        <Card className="mt-auto p-4" tone="elevated">
          {isAdmin ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ember-400">Audit Trail Active</p>
              <p className="mt-2 text-sm leading-6 text-white text-opacity-80">All actions are recorded under your ID.</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Play fair. Rise higher.</p>
              <p className="mt-2 text-sm leading-6 text-white">Build your match history one clean win at a time.</p>
            </>
          )}
        </Card>
      </aside>

      <div className="lg:pl-72">
        <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur lg:sticky lg:px-10">
          <Link className="flex items-center gap-2 lg:hidden" href={isAdmin ? "/admin" : "/"}>
            <span className="grid size-8 place-items-center rounded-lg bg-violet-600 font-display text-sm font-black text-white">B</span>
            <span className="font-display text-lg font-black tracking-tight text-white">BattlePlay</span>
          </Link>
          <p className="hidden text-sm font-medium text-muted lg:block">Your competitive gaming hub</p>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Suspense fallback={<WalletSummaryFallback />}><WalletSummaryWrapper /></Suspense>
          </div>
        </header>

        <div className="min-h-screen pb-24 pt-16 lg:pb-10 lg:pt-0">{children}</div>
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur lg:hidden">
          <AppNavigation variant="bottom" isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
