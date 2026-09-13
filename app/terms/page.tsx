import Link from "next/link";

import { TermsAcceptance } from "@/components/terms-acceptance";
import { Card } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";

export default async function TermsPage() {
  const user = await requirePageUser();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <Link className="text-sm font-semibold text-violet-400 hover:text-violet-300" href="/profile">← Profile</Link>
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400">TERMS</p>
        <h1 className="font-display text-4xl font-black tracking-tight text-white">BattlePlay rules</h1>
      </div>
      <Card className="space-y-4 p-6 leading-7 text-muted" tone="elevated">
        <p>Use your own Free Fire account details and follow the stated match rules.</p>
        <p>Match results and Free Fire ID verification are handled manually by the room host.</p>
        <p>Tokens, winnings, and withdrawals are recorded through the BattlePlay transaction ledger. Withdrawals are paid manually by an administrator.</p>
        <p>Acceptance is required before registering for a match.</p>
      </Card>
      <TermsAcceptance accepted={user.agreedToTerms} />
    </main>
  );
}
