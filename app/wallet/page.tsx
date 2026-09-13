import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWalletBalance } from "@/lib/wallet-balance";
import { reconcileTranzupiTopUp, type TopUpReconciliation } from "@/lib/wallet-topups";
import { WalletTopUp } from "@/components/wallet-top-up";
import { Card } from "@/components/ui/card";

const transactionStyle = {
  SUCCESS: "border-violet-500/40 bg-violet-700/20 text-violet-400",
  PENDING: "border-ember-500/50 bg-ember-700/20 text-ember-400",
  FAILED: "border-ember-600/50 bg-ember-700/20 text-ember-400",
  REJECTED: "border-line bg-elevated text-muted",
} as const;

const transactionLabel = {
  TOPUP: "Wallet top-up",
  MATCH_FEE: "Match entry fee",
  WINNINGS: "Winnings",
  WITHDRAWAL: "Withdrawal",
  REFUND: "Refund",
  PROMO_BONUS: "Promo bonus",
  REFERRAL_BONUS: "Referral bonus",
} as const;

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ topup?: string }> }) {
  const user = await requirePageUser();
  const { topup } = await searchParams;
  const pendingOrders = await prisma.transaction.findMany({
    where: { userId: user.id, type: "TOPUP", status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true },
  });
  const orderIds = new Set(pendingOrders.map((transaction) => transaction.id));
  if (topup && topup.length <= 100) orderIds.add(topup);
  const reconciliations = await Promise.all(
    [...orderIds].map(async (orderId) => {
      try {
        return [orderId, await reconcileTranzupiTopUp(orderId, user.id)] as const;
      } catch {
        return [orderId, "PENDING"] as const;
      }
    }),
  );
  const returnStatus: TopUpReconciliation | null = topup ? reconciliations.find(([orderId]) => orderId === topup)?.[1] ?? null : null;
  const [balance, transactions] = await Promise.all([
    getWalletBalance(user.id),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, type: true, amount: true, status: true, note: true, createdAt: true },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400">WALLET</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Your battle balance</h1>
        <p className="mt-2 text-muted">Every balance change is recorded in your transaction ledger.</p>
      </div>

      {returnStatus === "SUCCESS" ? <p className="rounded-xl border border-violet-500/35 bg-violet-700/15 p-4 text-sm font-semibold text-violet-400">Payment confirmed. Your wallet has been credited.</p> : null}
      {returnStatus === "PENDING" ? <p className="rounded-xl border border-ember-500/35 bg-ember-700/15 p-4 text-sm font-semibold text-ember-400">Your payment is still being confirmed. It will appear automatically once TranzUPI confirms it.</p> : null}
      {returnStatus === "FAILED" ? <p className="rounded-xl border border-ember-500/35 bg-ember-700/15 p-4 text-sm font-semibold text-ember-400">This payment was not confirmed. No funds were added.</p> : null}

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.4fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden p-6" tone="elevated">
            <p className="text-xs font-bold tracking-[0.18em] text-muted">AVAILABLE BALANCE</p>
            <p className="mt-3 font-display text-5xl font-black tracking-tight text-white">₹{balance.toFixed(2)}</p>
            <p className="mt-3 text-sm leading-6 text-muted">Only successful credits and debits count toward this amount.</p>
          </Card>
          <WalletTopUp />
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-violet-400">LEDGER</p>
              <h2 className="mt-2 font-display text-2xl font-black text-white">Recent transactions</h2>
            </div>
            <span className="text-xs font-semibold text-muted">Latest 20</span>
          </div>

          {transactions.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-line p-5 text-sm text-muted">No transactions yet. Your verified top-ups and future match activity will appear here.</p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {transactions.map((transaction) => (
                <li className="flex items-center justify-between gap-4 py-4" key={transaction.id}>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{transactionLabel[transaction.type]}</p>
                    <p className="mt-1 truncate text-xs text-muted">{transaction.note ?? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(transaction.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-white">₹{transaction.amount.toFixed(2)}</p>
                    <span className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-bold tracking-[0.12em] ${transactionStyle[transaction.status]}`}>{transaction.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </main>
  );
}
