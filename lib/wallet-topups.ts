import "server-only";

import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { checkTranzupiOrderStatus } from "@/lib/tranzupi";

export type TopUpReconciliation = "SUCCESS" | "PENDING" | "FAILED" | "NOT_FOUND";

export async function reconcileTranzupiTopUp(orderId: string, userId?: string): Promise<TopUpReconciliation> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, amount: true, type: true, status: true },
  });

  if (!transaction || transaction.type !== "TOPUP" || (userId && transaction.userId !== userId)) return "NOT_FOUND";
  if (transaction.status === "SUCCESS") return "SUCCESS";
  if (transaction.status !== "PENDING") return "FAILED";

  const providerOrder = await checkTranzupiOrderStatus(orderId);
  if (providerOrder.status === "PENDING" || providerOrder.status === "UNKNOWN" || providerOrder.status === "NOT_FOUND") return "PENDING";

  if (providerOrder.status !== "SUCCESS" || !providerOrder.amount) {
    await prisma.transaction.updateMany({ where: { id: transaction.id, status: "PENDING" }, data: { status: "FAILED", note: "TranzUPI reported that this top-up failed." } });
    return "FAILED";
  }

  let providerAmount: Prisma.Decimal;
  try {
    providerAmount = new Prisma.Decimal(providerOrder.amount);
  } catch {
    providerAmount = new Prisma.Decimal(-1);
  }

  if (!providerAmount.equals(transaction.amount)) {
    await prisma.transaction.updateMany({ where: { id: transaction.id, status: "PENDING" }, data: { status: "FAILED", note: "TranzUPI amount did not match the requested top-up." } });
    return "FAILED";
  }

  const completed = await prisma.transaction.updateMany({
    where: { id: transaction.id, status: "PENDING" },
    data: { status: "SUCCESS", note: `TranzUPI payment${providerOrder.utr ? ` UTR ${providerOrder.utr}` : ""} verified server-side.` },
  });

  if (completed.count === 1) {
    // Check if this was their first top-up to grant referral bonuses
    const user = await prisma.user.findUnique({
      where: { id: transaction.userId },
      select: { referredBy: true }
    });
    
    if (user?.referredBy) {
      const topUpCount = await prisma.transaction.count({
        where: { userId: transaction.userId, type: "TOPUP", status: "SUCCESS" }
      });
      
      if (topUpCount === 1) { // This is their first top-up!
        await prisma.transaction.createMany({
          data: [
            {
              userId: user.referredBy,
              type: "REFERRAL_BONUS",
              amount: 10,
              status: "SUCCESS",
              note: "Referral bonus: a user you referred completed their first top-up"
            },
            {
              userId: transaction.userId,
              type: "REFERRAL_BONUS",
              amount: 10,
              status: "SUCCESS",
              note: "First top-up bonus!"
            }
          ]
        });
      }
    }
    
    return "SUCCESS";
  }
  
  const latest = await prisma.transaction.findUnique({ where: { id: transaction.id }, select: { status: true } });
  return latest?.status === "SUCCESS" ? "SUCCESS" : "FAILED";
}
