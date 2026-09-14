import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { id } = await params;
  const registration = await prisma.registration.findUnique({ where: { userId_matchId: { userId: user.id, matchId: id } }, include: { match: true } });
  if (!registration) return NextResponse.json({ error: "Register for this match to view room details." }, { status: 403 });
  if (Date.now() < registration.match.matchTime.getTime() - 30 * 60_000) return NextResponse.json({ error: "Room details open 30 minutes before the match." }, { status: 403 });
  return NextResponse.json({ roomId: registration.match.roomId, roomPassword: registration.match.roomPassword, telegramGroupLink: registration.match.telegramGroupLink });
}
