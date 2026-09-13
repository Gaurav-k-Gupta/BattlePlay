import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MatchHistoryPage() {
  const user = await requirePageUser();
  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    orderBy: { registeredAt: "desc" },
    select: {
      id: true,
      freeFireIGNUsed: true,
      placement: true,
      match: { select: { title: true, matchTime: true, status: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8 sm:px-6 lg:px-10">
      <Link className="text-sm font-semibold text-violet-400 hover:text-violet-300" href="/profile">← Profile</Link>
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400">HISTORY</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Your matches</h1>
      </div>
      {registrations.length === 0 ? (
        <Card className="p-6 text-muted">You have not registered for a match yet.</Card>
      ) : (
        <ul className="space-y-3">
          {registrations.map((registration) => (
            <li key={registration.id}>
              <Card className="p-5" tone="elevated">
              <div className="flex items-start justify-between gap-3"><p className="font-semibold text-white">{registration.match.title}</p><Badge status={registration.match.status === "LIVE" ? "live" : registration.match.status === "COMPLETED" ? "completed" : "upcoming"}>{registration.match.status}</Badge></div>
              <p className="mt-2 text-sm leading-6 text-muted">
                {registration.match.matchTime.toLocaleString()} · {registration.match.status} · IGN: {registration.freeFireIGNUsed}
              </p>
              <p className="mt-3 text-sm font-semibold text-violet-400">
                {registration.placement ? `Placement: #${registration.placement}` : "Placement pending"}
              </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
