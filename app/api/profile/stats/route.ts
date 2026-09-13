import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const [matchesPlayed, firstPlaceFinishes, winnings] = await Promise.all([
    prisma.registration.count({ where: { userId: user.id } }),
    prisma.registration.count({ where: { userId: user.id, placement: 1 } }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "WINNINGS", status: "SUCCESS" },
      _sum: { amount: true },
    }),
  ]);

  const totalWinnings = winnings._sum.amount?.toString() ?? "0.00";
  const winRate = matchesPlayed === 0 ? 0 : Number(((firstPlaceFinishes / matchesPlayed) * 100).toFixed(1));

  return NextResponse.json({
    stats: { matchesPlayed, firstPlaceFinishes, totalWinnings, winRate },
  });
}
