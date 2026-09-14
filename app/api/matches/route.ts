import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchQuerySchema } from "@/lib/validation/matches";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = matchQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid match filters." }, { status: 400 });
  const matches = await prisma.match.findMany({
    where: { ...parsed.data, matchTime: { gte: new Date() } }, orderBy: { matchTime: "asc" }, take: 200,
    include: { registrations: { select: { slotNumber: true } } },
  });
  return NextResponse.json({ matches: matches.map((match) => ({ ...match, entryFee: match.entryFee.toFixed(2), prizePool: match.prizePool.toFixed(2), prizePerFinish: match.prizePerFinish.toFixed(2), winnerPrize: match.winnerPrize.toFixed(2), runnerUpPrize: match.runnerUpPrize.toFixed(2), occupiedSlots: match.registrations.map((r) => r.slotNumber) })) });
}
