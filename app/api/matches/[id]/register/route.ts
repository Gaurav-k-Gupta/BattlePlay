import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrationRateLimit } from "@/lib/ratelimit";
import { registrationSchema } from "@/lib/validation/matches";

const teamSize = { SOLO: 1, DUO: 2, SQUAD: 4 } as const;
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body: unknown = await request.json().catch(() => null); const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid team slot." }, { status: 400 });
  const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  if (registrationRateLimit) { const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? user.id; if (!(await registrationRateLimit.limit(key)).success) return NextResponse.json({ error: "Too many registration attempts." }, { status: 429 }); }
  const { id } = await params;
  try {
    const registration = await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({ where: { id } });
      if (!match || match.status !== "UPCOMING" || match.matchTime <= new Date()) throw new Error("MATCH_UNAVAILABLE");
      if (!user.agreedToTerms) throw new Error("TERMS_REQUIRED");
      if (!user.freeFireIGN) throw new Error("IGN_REQUIRED");
      const slots = match.lobbySize / teamSize[match.gameType];
      if (!Number.isInteger(slots) || parsed.data.slotNumber > slots) throw new Error("SLOT_INVALID");
      const totals = await tx.transaction.groupBy({ by: ["type"], where: { userId: user.id, status: "SUCCESS" }, _sum: { amount: true } });
      const credits = new Set(["TOPUP", "WINNINGS", "PROMO_BONUS", "REFERRAL_BONUS", "REFUND"]);
      const balance = totals.reduce((value, total) => credits.has(total.type) ? value.plus(total._sum.amount ?? 0) : value.minus(total._sum.amount ?? 0), new Prisma.Decimal(0));
      const fee = match.entryFee.mul(teamSize[match.gameType]);
      if (balance.lessThan(fee)) throw new Error("INSUFFICIENT_BALANCE");
      const overlap = await tx.registration.findFirst({ where: { userId: user.id, match: { status: { in: ["UPCOMING", "LIVE"] }, matchTime: { gte: new Date(match.matchTime.getTime() - 30 * 60_000), lte: new Date(match.matchTime.getTime() + 30 * 60_000) } } } });
      if (overlap) throw new Error("TIME_CONFLICT");
      const registration = await tx.registration.create({ data: { userId: user.id, matchId: id, freeFireIGNUsed: user.freeFireIGN, slotNumber: parsed.data.slotNumber, slotCount: teamSize[match.gameType] } });
      if (!fee.isZero()) await tx.transaction.create({ data: { userId: user.id, type: "MATCH_FEE", amount: fee, status: "SUCCESS", relatedMatchId: id, note: `Entry fee for ${match.title}, team slot ${parsed.data.slotNumber}.` } });
      return registration;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ registration }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That team slot or your registration is already taken." }, { status: 409 });
    const code = error instanceof Error ? error.message : ""; const messages: Record<string, string> = { MATCH_UNAVAILABLE: "This match is no longer available.", TERMS_REQUIRED: "Accept the terms before registering.", IGN_REQUIRED: "Add your Free Fire IGN to your profile first.", SLOT_INVALID: "That team slot is not available.", INSUFFICIENT_BALANCE: "Insufficient wallet balance.", TIME_CONFLICT: "You already have a match in this time window." };
    return NextResponse.json({ error: messages[code] ?? "Registration could not be completed." }, { status: 400 });
  }
}
