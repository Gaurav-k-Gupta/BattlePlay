import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

const labels = {
  FULL_MAP: "Full Map",
  CS: "Clash Squad",
  LW: "Lone Wolf",
  HEAD: "Headshot",
  LW_HEAD: "LW Headshot",
  FREE: "Free",
} as const;

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (category && Object.keys(labels).includes(category)) {
    // Show matches for specific category
    const matches = await prisma.match.findMany({
      where: { 
        status: "UPCOMING", 
        matchTime: { gte: new Date() },
        category: category as any,
      },
      orderBy: { matchTime: "asc" },
      take: 200,
      include: { registrations: { select: { slotNumber: true } } },
    });

    return (
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-10">
        <Link href="/matches" className="inline-flex items-center text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          BACK TO MODES
        </Link>
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
            <h2 className="font-display text-3xl font-black text-white uppercase tracking-wide">
              {labels[category as keyof typeof labels]} Matches
            </h2>
            <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-400 border border-violet-500/30">
              {matches.length} Matches
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {matches.length === 0 ? (
              <p className="text-muted">No upcoming matches in this category.</p>
            ) : matches.map((match) => {
              const teamSize = match.gameType === "SOLO" ? 1 : match.gameType === "DUO" ? 2 : 4;
              const totalSlots = match.lobbySize / teamSize;
              const filledSlots = match.registrations.length;
              const isFull = filledSlots >= totalSlots;

              return (
                <Link href={`/matches/${match.id}`} key={match.id} className={isFull ? "pointer-events-none opacity-50" : ""}>
                  <Card className="group relative overflow-hidden h-full flex flex-col p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] hover:border-violet-500/50 bg-canvas border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-black/50 px-2 py-1 text-xs font-bold text-muted border border-white/5">
                        {formatDate(match.matchTime)}
                      </span>
                      <span className="rounded bg-violet-600 px-2 py-1 text-xs font-bold text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                        {formatTime(match.matchTime)}
                      </span>
                    </div>

                    <div className="mt-5 flex-1">
                      <h3 className="font-display text-xl font-black text-white uppercase tracking-wide">{match.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-ember-400">{match.gameType} · {match.map}</p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Entry Fee</p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-white">
                          {match.paymentType === "FREE" ? "FREE" : `₹${match.entryFee.toFixed(0)}/pl`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Prize</p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-green-400">
                          ₹{match.winnerPrize.toFixed(0)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Slots ({filledSlots}/{totalSlots})</p>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div 
                            className="h-full bg-violet-500 transition-all duration-500" 
                            style={{ width: `${Math.min(100, (filledSlots / totalSlots) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-violet-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  // Show all categories
  const upcomingMatches = await prisma.match.findMany({
    where: { status: "UPCOMING", matchTime: { gte: new Date() } },
    select: { category: true },
  });

  const counts = upcomingMatches.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-canvas to-ember-900/20 border border-white/5 p-8 sm:p-12">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-ember-600/20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold tracking-[.2em] text-ember-400">TOURNAMENTS</p>
              <h1 className="mt-2 font-display text-5xl font-black text-white uppercase tracking-tight">Choose Your Arena</h1>
              <p className="mt-4 max-w-xl text-lg text-muted">Select a game mode and lock in your squad. Big prize pools and intense competition wait for you.</p>
            </div>
            <Link href="/profile/history" className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:bg-violet-500 transition shrink-0">
              My Matches
            </Link>
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-display text-2xl font-black text-white uppercase tracking-wide mb-6">Game Modes</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => {
            const count = counts[key] || 0;
            return (
              <Link href={`/matches?category=${key}`} key={key}>
                <Card className="group relative overflow-hidden h-full flex flex-col p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] hover:border-violet-500/50 bg-canvas border border-white/5">
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-2xl font-black text-white uppercase tracking-wide">{labels[key]}</h3>
                  </div>
                  
                  <p className="text-sm text-muted mb-6">Compete in {labels[key]} tournaments and climb the leaderboard.</p>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-sm font-bold text-violet-400">{count} upcoming</span>
                    <span className="text-ember-400 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  );
}
