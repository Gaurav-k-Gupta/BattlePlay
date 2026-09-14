import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { MatchStatus } from "@/generated/prisma/client";

const labels = {
  FULL_MAP: "Full Map",
  CS: "Clash Squad",
  LW: "Lone Wolf",
  HEAD: "Headshot",
  LW_HEAD: "LW Headshot",
  FREE: "Free",
} as const;

export default async function AdminMatchesPage({ searchParams }: { searchParams: Promise<{ category?: string; status?: string }> }) {
  const { category, status } = await searchParams;

  const currentStatus = (status as MatchStatus) || "UPCOMING";

  if (category && Object.keys(labels).includes(category)) {
    const matches = await prisma.match.findMany({
      where: {
        category: category as any,
        status: currentStatus,
      },
      orderBy: { matchTime: "asc" },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/matches" className="text-muted hover:text-white transition">
                &larr; Back
              </Link>
              <h2 className="font-display text-2xl font-black text-white">{labels[category as keyof typeof labels]} Matches</h2>
            </div>
          </div>
          <Link href="/admin/matches/create" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-bold text-sm transition">
            Create Match
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 pb-2 overflow-x-auto border-b border-line">
          {["UPCOMING", "LIVE", "COMPLETED", "CANCELLED"].map(s => (
            <Link 
              key={s} 
              href={`/admin/matches?category=${category}&status=${s}`}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${currentStatus === s ? 'border-violet-500 text-white' : 'border-transparent text-muted hover:text-white'}`}
            >
              {s}
            </Link>
          ))}
        </div>

        <Card className="p-0 overflow-hidden divide-y divide-line">
          {matches.map(match => (
            <div key={match.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white">{match.title}</p>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                    match.status === 'UPCOMING' ? 'bg-violet-500/20 text-violet-400' :
                    match.status === 'LIVE' ? 'bg-ember-500/20 text-ember-400' :
                    match.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    'bg-white/10 text-muted'
                  }`}>
                    {match.status}
                  </span>
                </div>
                <div className="text-xs text-muted flex gap-3 mt-1.5 items-center">
                  <span>{match.gameType} / {match.category}</span>
                  <span>•</span>
                  <span>{match._count.registrations} / {match.lobbySize} players</span>
                  <span>•</span>
                  <span>{new Intl.DateTimeFormat("en-IN", { dateStyle: "short", timeStyle: "short" }).format(match.matchTime)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/matches/${match.id}/edit`} className="px-3 py-1.5 border border-line rounded-lg text-xs font-semibold text-white hover:bg-elevated transition">Edit</Link>
                <Link href={`/admin/matches/${match.id}/registrations`} className="px-3 py-1.5 border border-violet-500/50 bg-violet-700/10 rounded-lg text-xs font-semibold text-violet-400 hover:bg-violet-700/30 transition">Registrations</Link>
              </div>
            </div>
          ))}
          {matches.length === 0 && <p className="p-6 text-center text-muted text-sm">No matches found for {currentStatus}.</p>}
        </Card>
      </div>
    );
  }

  // Show Category Grid
  const matchCounts = await prisma.match.groupBy({
    by: ["category"],
    _count: { _all: true }
  });

  const counts = matchCounts.reduce((acc, curr) => {
    acc[curr.category] = curr._count._all;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-black text-white">Match Management</h2>
          <p className="text-sm text-muted mt-1">Select a category to manage matches</p>
        </div>
        <Link href="/admin/matches/create" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-bold text-sm transition">
          Create Match
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => {
          const count = counts[key] || 0;
          return (
            <Link href={`/admin/matches?category=${key}`} key={key}>
              <Card className="group relative overflow-hidden h-full flex flex-col p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] hover:border-violet-500/50 bg-canvas border border-white/5">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-black text-white uppercase tracking-wide">{labels[key]}</h3>
                </div>
                
                <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-sm font-bold text-violet-400">{count} total matches</span>
                  <span className="text-ember-400 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
