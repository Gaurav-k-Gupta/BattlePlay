import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePageUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MatchHistoryPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "ongoing" } = await searchParams;
  const user = await requirePageUser();
  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    orderBy: { registeredAt: "desc" },
    select: {
      id: true,
      freeFireIGNUsed: true,
      placement: true,
      match: { select: { id: true, title: true, matchTime: true, status: true } },
    },
  });

  const upcoming = registrations.filter(r => r.match.status === "UPCOMING");
  const ongoing = registrations.filter(r => r.match.status === "LIVE");
  const past = registrations.filter(r => r.match.status === "COMPLETED" || r.match.status === "CANCELLED");

  let activeList = ongoing;
  let activeTitle = "Ongoing Matches";
  
  if (tab === "upcoming") {
    activeList = upcoming;
    activeTitle = "Upcoming Matches";
  } else if (tab === "past") {
    activeList = past;
    activeTitle = "Past Matches";
  }

  const renderSection = (title: string, list: typeof registrations) => (
    <div className="space-y-4">
      {list.length === 0 ? (
        <Card className="p-6 text-muted border border-white/5 bg-canvas/50 text-center">No matches found in this category.</Card>
      ) : (
        <ul className="space-y-3">
          {list.map((registration) => (
            <li key={registration.id}>
              <Link href={`/matches/${registration.match.id}`}>
                <Card className="p-5 transition hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg border border-white/5 bg-elevated/50" tone="elevated">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-white">{registration.match.title}</p>
                    <Badge status={registration.match.status === "LIVE" ? "live" : registration.match.status === "COMPLETED" ? "completed" : "upcoming"}>
                      {registration.match.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {registration.match.matchTime.toLocaleString()} · IGN: {registration.freeFireIGNUsed}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-violet-400">
                    {registration.placement ? `Placement: #${registration.placement}` : "Placement pending"}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <Link className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors" href="/profile">← Back to Profile</Link>
        <p className="mt-6 text-xs font-bold tracking-[0.2em] text-violet-400">HISTORY</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Your matches</h1>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto border-b border-line">
        {[
          { id: "ongoing", label: "Ongoing" },
          { id: "upcoming", label: "Upcoming" },
          { id: "past", label: "Past" }
        ].map(t => (
          <Link 
            key={t.id} 
            href={`/profile/history?tab=${t.id}`}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-violet-500 text-white' : 'border-transparent text-muted hover:text-white'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        {renderSection(activeTitle, activeList)}
      </div>
    </main>
  );
}
