import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminWithdrawalActionSchema } from "@/lib/validation/admin";
import { Prisma } from "@/generated/prisma/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = adminWithdrawalActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid withdrawal action data", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const withdrawal = await prisma.$transaction(async (tx) => {
      const existing = await tx.withdrawalRequest.findUnique({ where: { id } });
      if (!existing) throw new Error("WITHDRAWAL_NOT_FOUND");
      if (existing.status === "PAID" || existing.status === "REJECTED") {
        throw new Error("WITHDRAWAL_ALREADY_FINALIZED");
      }

      const updated = await tx.withdrawalRequest.update({
        where: { id },
        data: {
          status: parsed.data.status,
          adminNote: parsed.data.adminNote,
          actionedBy: user.id, // Audit trail
          actionedAt: new Date()
        }
      });

      // If rejected, refund the user's wallet by marking the original SUCCESS transaction as FAILED
      if (parsed.data.status === "REJECTED") {
        await tx.transaction.updateMany({
          where: { relatedWithdrawalId: id, type: "WITHDRAWAL", status: "SUCCESS" },
          data: { status: "FAILED" }
        });
        
        await tx.notification.create({
          data: {
            userId: existing.userId,
            title: "Withdrawal Rejected",
            message: `Your withdrawal request of ₹${existing.amount.toFixed(0)} was rejected. ${parsed.data.adminNote ? `Reason: ${parsed.data.adminNote}` : ''}`,
            type: "WITHDRAWAL_UPDATE"
          }
        });
      } else if (parsed.data.status === "PAID") {
        await tx.notification.create({
          data: {
            userId: existing.userId,
            title: "Withdrawal Paid",
            message: `Your withdrawal request of ₹${existing.amount.toFixed(0)} has been paid to ${existing.upiId}.`,
            type: "WITHDRAWAL_UPDATE"
          }
        });
      } else if (parsed.data.status === "APPROVED") {
        await tx.notification.create({
          data: {
            userId: existing.userId,
            title: "Withdrawal Approved",
            message: `Your withdrawal request of ₹${existing.amount.toFixed(0)} has been approved and is being processed for payout.`,
            type: "WITHDRAWAL_UPDATE"
          }
        });
      }

      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ withdrawal }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "WITHDRAWAL_NOT_FOUND") return NextResponse.json({ error: "Withdrawal request not found." }, { status: 404 });
    if (msg === "WITHDRAWAL_ALREADY_FINALIZED") return NextResponse.json({ error: "This request has already been finalized." }, { status: 400 });
    return NextResponse.json({ error: "Failed to update withdrawal request" }, { status: 500 });
  }
}
