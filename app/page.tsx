import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { SignInButton } from "@/components/sign-in-button";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  const upcomingMatches = await prisma.match.findMany({
    where: { status: "UPCOMING", matchTime: { gte: new Date() } },
    orderBy: { matchTime: "asc" },
    take: 4,
    include: { registrations: { select: { slotNumber: true } } },
  });

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

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-10 sm:px-6 lg:min-h-[calc(100vh-4rem)] lg:px-10">
      
      {/* Hero Section */}
      <div className="flex flex-col justify-center gap-7 pt-10 pb-20">
        <p className="text-xs font-bold tracking-[0.2em] text-violet-400 uppercase">BattlePlay · Esports Arena</p>
        <h1 className="max-w-4xl font-display text-5xl font-black tracking-tight text-white sm:text-7xl uppercase leading-tight">
          Fantasy esports, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-ember-400">built for fair play.</span>
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted">Compete in organized tournaments, build your history, and keep every reward transparent. Lock in your squad today.</p>
        
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {session?.user ? (
            <>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-600 px-8 text-sm font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:bg-violet-500 hover:scale-105" href="/matches">
                Browse Tournaments
              </Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-8 text-sm font-bold text-white transition-all hover:bg-white/10 hover:scale-105" href="/profile">
                Player Profile
              </Link>
            </>
          ) : (
            <>
              <SignInButton />
              <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-8 text-sm font-bold text-white transition-all hover:bg-white/10 hover:scale-105" href="/matches">
                Browse Tournaments
              </Link>
            </>
          )}
        </div>
        
        <PwaInstallPrompt />
      </div>

      {/* Featured Matches Section */}
      {upcomingMatches.length > 0 && (
        <section className="mt-10 border-t border-white/10 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-black text-white uppercase tracking-wide">
              Starting Soon
            </h2>
            <Link href="/matches" className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors">
              VIEW ALL &rarr;
            </Link>
          </div>
          
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingMatches.map((match) => {
              const teamSize = match.gameType === "SOLO" ? 1 : match.gameType === "DUO" ? 2 : 4;
              const totalSlots = match.lobbySize / teamSize;
              const filledSlots = match.registrations.length;
              const isFull = filledSlots >= totalSlots;

              return (
                <Link href={`/matches/${match.id}`} key={match.id} className={isFull ? "pointer-events-none opacity-50" : ""}>
                  <Card className="group relative overflow-hidden h-full flex flex-col p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(255,90,95,0.15)] hover:border-ember-500/50 bg-canvas border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-black/50 px-2 py-1 text-xs font-bold text-muted border border-white/5">
                        {formatDate(match.matchTime)}
                      </span>
                      <span className="rounded bg-ember-600 px-2 py-1 text-xs font-bold text-white shadow-[0_0_10px_rgba(255,90,95,0.5)]">
                        {formatTime(match.matchTime)}
                      </span>
                    </div>

                    <div className="mt-5 flex-1">
                      <h3 className="font-display text-lg font-black text-white uppercase tracking-wide line-clamp-1">{match.title}</h3>
                      <p className="mt-1 text-xs font-bold text-violet-400">{match.gameType} · {match.category}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Prize</p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-green-400">₹{match.winnerPrize.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Slots</p>
                        <p className="mt-0.5 font-mono text-sm font-bold text-white">{filledSlots}/{totalSlots}</p>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ember-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      
    </main>
  );
}
