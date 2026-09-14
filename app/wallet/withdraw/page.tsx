import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { WithdrawalForm } from "./withdrawal-form";
import { getWalletBalance } from "@/lib/wallet-balance";

export default async function WithdrawPage() {
  const user = await requirePageUser();
  const [balance, requests] = await Promise.all([
    getWalletBalance(user.id),
    prisma.withdrawalRequest.findMany({
      where: { userId: user.id },
      orderBy: { requestedAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <Link href="/wallet" className="inline-flex items-center text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        BACK TO WALLET
      </Link>
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400">WITHDRAW FUNDS</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Request Payout</h1>
        <p className="mt-2 text-muted">Withdraw your winnings to your UPI account. Minimum withdrawal is ₹50.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6" tone="elevated">
          <p className="text-xs font-bold tracking-[0.18em] text-muted">AVAILABLE BALANCE</p>
          <p className="mt-3 font-display text-4xl font-black tracking-tight text-white">₹{balance.toFixed(2)}</p>
          <div className="mt-6">
            <WithdrawalForm maxAmount={balance.toNumber()} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-2xl font-black text-white mb-4">Past Requests</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-muted italic">You haven't made any withdrawal requests yet.</p>
          ) : (
            <ul className="space-y-4">
              {requests.map(req => (
                <li key={req.id} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-white">₹{req.amount.toFixed(0)}</p>
                    <p className="text-xs text-muted mt-0.5">{req.upiId}</p>
                    <p className="text-[10px] text-muted mt-1">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(req.requestedAt)}</p>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    req.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                    req.status === 'PENDING' ? 'bg-ember-500/20 text-ember-400' :
                    req.status === 'APPROVED' ? 'bg-violet-500/20 text-violet-400' :
                    'bg-white/10 text-muted'
                  }`}>
                    {req.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}
