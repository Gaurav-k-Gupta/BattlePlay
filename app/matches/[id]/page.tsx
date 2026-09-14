import { notFound } from "next/navigation";
import { MatchRegister } from "@/components/match-register";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const sizes = { SOLO: 1, DUO: 2, SQUAD: 4 } as const;

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [match, user] = await Promise.all([
    prisma.match.findUnique({
      where: { id },
      include: { registrations: { select: { slotNumber: true, userId: true, placement: true, finishes: true } } },
    }),
    getCurrentUser(),
  ]);

  if (!match) notFound();

  const slots = match.lobbySize / sizes[match.gameType];
  const filledSlots = match.registrations.length;
  const userRegistration = user ? match.registrations.find((r) => r.userId === user.id) : null;
  const isRegistered = !!userRegistration;

  let winningsTx = null;
  if (isRegistered && match.status === "COMPLETED") {
    winningsTx = await prisma.transaction.findFirst({
      where: { userId: user!.id, type: "WINNINGS", relatedMatchId: match.id, status: "SUCCESS" },
    });
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-10">
      <Link href="/matches" className="inline-flex items-center text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        BACK TO TOURNAMENTS
      </Link>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-canvas to-ember-900/20 border border-white/5 p-8 sm:p-12">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-ember-600/20 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded bg-violet-600 px-3 py-1 text-xs font-bold tracking-wider text-white shadow-[0_0_15px_rgba(139,92,246,0.6)]">
              {match.gameType}
            </span>
            <span className="rounded bg-black/40 px-3 py-1 text-xs font-bold tracking-wider text-ember-400 border border-white/5">
              {match.paymentType}
            </span>
          </div>

          <h1 className="mt-4 font-display text-5xl font-black text-white uppercase tracking-tight">{match.title}</h1>
          
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-black/20 p-4 border border-white/5 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Map</p>
              <p className="mt-1 text-lg font-bold text-white">{match.map}</p>
            </div>
            <div className="rounded-2xl bg-black/20 p-4 border border-white/5 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Schedule</p>
              <p className="mt-1 text-lg font-bold text-white">
                {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(match.matchTime)}
              </p>
            </div>
            <div className="rounded-2xl bg-black/20 p-4 border border-white/5 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Entry Fee</p>
              <p className="mt-1 text-lg font-bold text-white">
                {match.paymentType === "FREE" ? "Free" : `₹${match.entryFee.toFixed(0)} × ${sizes[match.gameType]} pl`}
              </p>
            </div>
            <div className="rounded-2xl bg-black/20 p-4 border border-violet-500/30 bg-violet-900/10 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Winner Prize</p>
              <p className="mt-1 text-lg font-bold text-green-400 shadow-green-500/50 drop-shadow-md">
                ₹{match.winnerPrize.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {match.status === "COMPLETED" && isRegistered && userRegistration?.placement && (
            <Card className="p-8 bg-green-900/20 border-green-500/50 backdrop-blur relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <span className="grid size-10 place-items-center rounded-xl bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <div>
                  <h2 className="font-display text-2xl font-black text-white tracking-wide">Match Results</h2>
                  <p className="text-sm text-green-300">Your final standing and rewards</p>
                </div>
              </div>
              <div className="relative z-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-black/40 p-4 border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Your Placement</p>
                  <p className="mt-1 font-display text-3xl font-black text-white tracking-tight">#{userRegistration.placement}</p>
                </div>
                {(userRegistration.finishes ?? 0) > 0 && (
                  <div className="rounded-xl bg-black/40 p-4 border border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Finishes</p>
                    <p className="mt-1 font-display text-3xl font-black text-white tracking-tight">{userRegistration.finishes}</p>
                  </div>
                )}
                {winningsTx && (
                  <div className="rounded-xl bg-green-900/40 p-4 border border-green-500/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-300">Amount Won</p>
                    <p className="mt-1 font-display text-3xl font-black text-green-400 tracking-tight shadow-green-500/50 drop-shadow-md">
                      ₹{winningsTx.amount.toFixed(0)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {isRegistered && (match.roomId || match.telegramGroupLink) && (
            <Card className="p-8 bg-violet-900/10 border-violet-500/50 backdrop-blur relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <span className="grid size-10 place-items-center rounded-xl bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </span>
                <div>
                  <h2 className="font-display text-2xl font-black text-white tracking-wide">Room Details</h2>
                  <p className="text-sm text-violet-300">Confidential info for registered players</p>
                </div>
              </div>

              <div className="relative z-10 grid gap-4 sm:grid-cols-2">
                {match.roomId && (
                  <>
                    <div className="rounded-xl bg-black/40 p-4 border border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Room ID</p>
                      <p className="mt-1 font-mono text-xl font-bold text-white tracking-widest">{match.roomId}</p>
                    </div>
                    <div className="rounded-xl bg-black/40 p-4 border border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Password</p>
                      <p className="mt-1 font-mono text-xl font-bold text-white tracking-widest">{match.roomPassword || "No Password"}</p>
                    </div>
                  </>
                )}
              </div>
              
              {match.telegramGroupLink && (
                <div className="relative z-10 mt-4 rounded-xl bg-blue-600/20 p-4 border border-blue-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Join the Telegram Group</p>
                    <p className="text-xs text-blue-300 mt-1">Coordinate with players and hosts</p>
                  </div>
                  <a href={match.telegramGroupLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)] transition">
                    Join Group
                  </a>
                </div>
              )}
            </Card>
          )}

          <Card className="p-8 bg-canvas/80 backdrop-blur border border-white/5">
            <h2 className="font-display text-2xl font-black text-white uppercase tracking-wide border-b border-white/5 pb-4 mb-4">
              Match Rules
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-line text-muted leading-relaxed">
                {match.rules}
              </p>
            </div>
            {match.description && (
              <p className="mt-6 text-sm text-muted/80 italic">{match.description}</p>
            )}
            
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
               <div className="rounded-xl bg-white/5 p-4">
                 <p className="text-xs font-bold text-muted uppercase tracking-wider">Per Finish Bonus</p>
                 <p className="mt-1 text-xl font-bold text-white">₹{match.prizePerFinish.toFixed(0)}</p>
               </div>
               <div className="rounded-xl bg-white/5 p-4">
                 <p className="text-xs font-bold text-muted uppercase tracking-wider">Runner-up Prize</p>
                 <p className="mt-1 text-xl font-bold text-white">₹{match.runnerUpPrize.toFixed(0)}</p>
               </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-canvas/80 backdrop-blur border-violet-500/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent pointer-events-none" />
            
            <h2 className="font-display text-2xl font-black text-white uppercase tracking-wide relative z-10">
              Registration
            </h2>
            
            <div className="mt-4 mb-6 relative z-10">
              <div className="flex justify-between text-xs font-bold text-muted mb-2 uppercase tracking-wider">
                <span>Slots Filled</span>
                <span>{filledSlots} / {slots}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div 
                  className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)] transition-all duration-500" 
                  style={{ width: `${Math.min(100, (filledSlots / slots) * 100)}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-muted mb-6 relative z-10">
              Each slot reserves a complete {match.gameType.toLowerCase()} team of {sizes[match.gameType]} player{sizes[match.gameType] > 1 ? "s" : ""}.
            </p>

            <div className="relative z-10">
              {user ? (
                <MatchRegister 
                  matchId={match.id} 
                  occupied={match.registrations.map((r) => r.slotNumber)} 
                  slots={slots} 
                  agreedToTerms={user.agreedToTerms}
                />
              ) : (
                <div className="rounded-xl bg-white/5 p-4 text-center border border-white/5">
                  <p className="text-violet-400 font-semibold mb-3">Sign in to claim your slot.</p>
                  <Link href="/api/auth/signin" className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] w-full">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
