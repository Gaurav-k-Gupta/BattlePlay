import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id }, include: { registrations: { select: { slotNumber: true } } } });
  if (!match) return NextResponse.json({ error: "Match not found." }, { status: 404 });
  return NextResponse.json({ match: { ...match, entryFee: match.entryFee.toFixed(2), prizePool: match.prizePool.toFixed(2), prizePerFinish: match.prizePerFinish.toFixed(2), winnerPrize: match.winnerPrize.toFixed(2), runnerUpPrize: match.runnerUpPrize.toFixed(2), occupiedSlots: match.registrations.map((r) => r.slotNumber) } });
}
