import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache leaderboard for 60 seconds

export default async function LeaderboardPage() {
  // Aggregate total winnings per user
  const winningsGroup = await prisma.transaction.groupBy({
    by: ['userId'],
    where: { type: "WINNINGS", status: "SUCCESS" },
    _sum: { amount: true },
  });

  // Aggregate total finishes per user
  const finishesGroup = await prisma.registration.groupBy({
    by: ['userId'],
    where: { match: { status: "COMPLETED" } },
    _sum: { finishes: true },
  });

  // Fetch users involved
  const userIds = new Set([...winningsGroup.map(g => g.userId), ...finishesGroup.map(g => g.userId)]);
  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: { id: true, name: true, freeFireIGN: true }
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  // Combine data
  const leaderboardData = Array.from(userIds).map(userId => {
    const user = userMap.get(userId);
    const winnings = winningsGroup.find(g => g.userId === userId)?._sum.amount?.toNumber() || 0;
    const finishes = finishesGroup.find(g => g.userId === userId)?._sum.finishes || 0;

    return {
      userId,
      name: user?.name || "Unknown",
      ign: user?.freeFireIGN || "Not Set",
      winnings,
      finishes
    };
  });

  // Sort by Winnings, then Finishes
  leaderboardData.sort((a, b) => {
    if (b.winnings !== a.winnings) return b.winnings - a.winnings;
    return b.finishes - a.finishes;
  });

  // Take top 50
  const topUsers = leaderboardData.slice(0, 50);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-10">
      <div>
        <p className="mt-6 text-xs font-bold tracking-[0.2em] text-violet-400">LEADERBOARD</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white">Top Players</h1>
      </div>

      <Card className="p-0 overflow-hidden" tone="elevated">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white whitespace-nowrap">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted border-b border-line">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4 text-center">Finishes</th>
                <th className="px-6 py-4 text-right">Total Won</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {topUsers.map((player, index) => {
                const isTop3 = index < 3;
                return (
                  <tr key={player.userId} className={`transition ${isTop3 ? 'bg-violet-900/10 hover:bg-violet-900/20' : 'hover:bg-white/5'}`}>
                    <td className="px-6 py-4">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full font-black text-sm
                        ${index === 0 ? 'bg-yellow-500 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 
                          index === 1 ? 'bg-slate-300 text-slate-900' :
                          index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-white/5 text-muted'}
                      `}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-base">{player.name}</p>
                      {player.ign !== "Not Set" && <p className="text-xs text-muted">IGN: {player.ign}</p>}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-violet-300">
                      {player.finishes}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-black text-lg ${isTop3 ? 'text-green-400 drop-shadow-md' : 'text-green-500'}`}>
                        ₹{player.winnings.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {topUsers.length === 0 && (
            <p className="p-8 text-center text-muted border-b border-line">No players have earned winnings yet.</p>
          )}
        </div>
      </Card>
    </main>
  );
}
