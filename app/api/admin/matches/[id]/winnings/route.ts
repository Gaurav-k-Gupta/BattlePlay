import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id },
        include: { registrations: true }
      });

      if (!match) throw new Error("MATCH_NOT_FOUND");
      if (match.status !== "COMPLETED") throw new Error("MATCH_NOT_COMPLETED");

      const placements = match.registrations.map(r => r.placement).filter(p => p !== null);
      const uniquePlacements = new Set(placements);
      if (placements.length !== uniquePlacements.size) {
        throw new Error("DUPLICATE_PLACEMENTS");
      }

      let processedCount = 0;
      const transactions = [];
      const notifications = [];

      for (const reg of match.registrations) {
        if (reg.winningsCredited) continue;

        let prizeAmount = new Prisma.Decimal(0);
        if (reg.placement === 1) {
          prizeAmount = prizeAmount.plus(match.winnerPrize);
        } else if (reg.placement === 2) {
          prizeAmount = prizeAmount.plus(match.runnerUpPrize);
        }

        if (reg.finishes > 0) {
          prizeAmount = prizeAmount.plus(match.prizePerFinish.mul(reg.finishes));
        }

        if (prizeAmount.greaterThan(0)) {
          transactions.push({
            userId: reg.userId,
            type: "WINNINGS" as const,
            amount: prizeAmount,
            status: "SUCCESS" as const,
            relatedMatchId: id,
            note: `Winnings for ${match.title} (Placement: ${reg.placement})`,
            createdBy: user.id // Audit trail
          });

          notifications.push({
            userId: reg.userId,
            title: "Winnings Credited!",
            message: `Congratulations! You won ₹${prizeAmount.toFixed(0)} for your placement in ${match.title}.`,
            type: "WINNINGS_CREDITED" as const,
          });

          await tx.registration.update({
            where: { id: reg.id },
            data: { winningsCredited: true }
          });
          processedCount++;
        }
      }

      if (transactions.length > 0) {
        await tx.transaction.createMany({ data: transactions });
      }
      if (notifications.length > 0) {
        await tx.notification.createMany({ data: notifications });
      }

      return processedCount;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ message: `Credited winnings for ${result} players.` }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "MATCH_NOT_FOUND") return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (msg === "MATCH_NOT_COMPLETED") return NextResponse.json({ error: "Match must be COMPLETED before crediting winnings." }, { status: 400 });
    if (msg === "DUPLICATE_PLACEMENTS") return NextResponse.json({ error: "Duplicate placements detected. Please ensure no two players share the same placement number." }, { status: 400 });
    return NextResponse.json({ error: "Failed to credit winnings" }, { status: 500 });
  }
}
