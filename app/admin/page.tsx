import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminDashboard() {
  const [totalUsers, activeMatches, pendingWithdrawals, totals] = await Promise.all([
    prisma.user.count(),
    prisma.match.count({ where: { status: { in: ["UPCOMING", "LIVE"] } } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    prisma.transaction.groupBy({
      by: ["type"],
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    })
  ]);

  const totalTopUps = totals.find(t => t.type === "TOPUP")?._sum.amount?.toNumber() ?? 0;
  const totalPaidWithdrawals = totals.find(t => t.type === "WITHDRAWAL")?._sum.amount?.toNumber() ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6" tone="elevated">
          <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Total Users</p>
          <p className="mt-3 font-display text-4xl font-black text-white">{totalUsers}</p>
        </Card>
        <Card className="p-6" tone="elevated">
          <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Active Matches</p>
          <p className="mt-3 font-display text-4xl font-black text-white">{activeMatches}</p>
        </Card>
        <Card className="p-6" tone="elevated">
          <p className="text-xs font-bold tracking-[0.18em] text-muted uppercase">Pending Withdrawals</p>
          <p className="mt-3 font-display text-4xl font-black text-white">{pendingWithdrawals}</p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs font-bold tracking-[0.18em] text-violet-400 uppercase">Total Top-Ups</p>
          <p className="mt-3 font-display text-3xl font-black text-white">₹{totalTopUps.toFixed(0)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-bold tracking-[0.18em] text-ember-400 uppercase">Total Processed Withdrawals</p>
          <p className="mt-3 font-display text-3xl font-black text-white">₹{totalPaidWithdrawals.toFixed(0)}</p>
        </Card>
      </div>
      
      <div className="pt-4 border-t border-line mt-8 flex justify-end">
        <SignOutButton />
      </div>
    </div>
  );
}
