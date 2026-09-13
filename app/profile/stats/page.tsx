import Link from "next/link";

import { StatBlock } from "@/components/ui/stat-block";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfileStatsPage() {
  const user = await requirePageUser();
  const [matchesPlayed, firstPlaceFinishes, winnings] = await Promise.all([
    prisma.registration.count({ where: { userId: user.id } }),
    prisma.registration.count({ where: { userId: user.id, placement: 1 } }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "WINNINGS", status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ]);
  const winRate = matchesPlayed === 0 ? 0 : Number(((firstPlaceFinishes / matchesPlayed) * 100).toFixed(1));

  const stats: Array<{ label: string; value: string | number }> = [
    { label: "Matches played", value: matchesPlayed },
    { label: "First-place finishes", value: firstPlaceFinishes },
    { label: "Win rate", value: `${winRate}%` },
    { label: "Total winnings", value: `₹${winnings._sum.amount?.toString() ?? "0.00"}` },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <Link className="text-sm font-semibold text-violet-400 hover:text-violet-300" href="/profile">← Profile</Link>
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400">STATS</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Your performance</h1>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        {stats.map(({ label, value }) => (
          <StatBlock key={label} label={label} value={value} />
        ))}
      </dl>
    </main>
  );
}
