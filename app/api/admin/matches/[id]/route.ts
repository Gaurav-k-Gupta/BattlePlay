import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminMatchEditSchema } from "@/lib/validation/admin";
import { Prisma } from "@/generated/prisma/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = adminMatchEditSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid match data", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const match = await prisma.$transaction(async (tx) => {
      const existingMatch = await tx.match.findUnique({ where: { id }, include: { registrations: true } });
      if (!existingMatch) throw new Error("MATCH_NOT_FOUND");

      const updatedMatch = await tx.match.update({
        where: { id },
        data: {
          ...parsed.data,
          lastEditedBy: user.id, // Audit trail
        }
      });

      // Handle Notifications for Room Details
      const roomDetailsAdded = !existingMatch.roomId && updatedMatch.roomId;
      if (roomDetailsAdded) {
        const notifications = existingMatch.registrations.map(reg => ({
          userId: reg.userId,
          title: "Room Details Available",
          message: `Room details for ${updatedMatch.title} are now available!`,
          type: "ROOM_AVAILABLE" as const,
        }));
        if (notifications.length > 0) {
          await tx.notification.createMany({ data: notifications });
        }
      }

      // Handle Match Cancellation Refunds
      if (existingMatch.status !== "CANCELLED" && updatedMatch.status === "CANCELLED") {
        const fee = updatedMatch.entryFee;
        const slotsPerTeam = updatedMatch.lobbySize / (updatedMatch.gameType === "SOLO" ? 1 : updatedMatch.gameType === "DUO" ? 2 : 4); // simplistic
        const actualFee = fee.mul(updatedMatch.gameType === "SOLO" ? 1 : updatedMatch.gameType === "DUO" ? 2 : 4);
        
        if (!actualFee.isZero()) {
          const refunds = existingMatch.registrations.map(reg => ({
            userId: reg.userId,
            type: "REFUND" as const,
            amount: actualFee,
            status: "SUCCESS" as const,
            relatedMatchId: id,
            note: `Refund for cancelled match: ${updatedMatch.title}`,
            createdBy: user.id, // Audit trail
          }));
          if (refunds.length > 0) {
            await tx.transaction.createMany({ data: refunds });
          }
        }
      }

      return updatedMatch;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ match }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "MATCH_NOT_FOUND") {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}
