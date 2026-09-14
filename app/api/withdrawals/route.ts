import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withdrawalRequestSchema } from "@/lib/validation/withdrawals";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null); 
  const parsed = withdrawalRequestSchema.safeParse(body);
  
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid withdrawal request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  
  const user = await getCurrentUser(); 
  if (!user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  try {
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Calculate current wallet balance manually to ensure transactional safety
      const totals = await tx.transaction.groupBy({ 
        by: ["type"], 
        where: { userId: user.id, status: "SUCCESS" }, 
        _sum: { amount: true } 
      });
      
      const credits = new Set(["TOPUP", "WINNINGS", "PROMO_BONUS", "REFERRAL_BONUS", "REFUND"]);
      const balance = totals.reduce((value, total) => 
        credits.has(total.type) 
          ? value.plus(total._sum.amount ?? 0) 
          : value.minus(total._sum.amount ?? 0), 
        new Prisma.Decimal(0)
      );
      
      const withdrawalAmount = new Prisma.Decimal(parsed.data.amount);
      if (balance.lessThan(withdrawalAmount)) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // Create the pending withdrawal request
      const requestRow = await tx.withdrawalRequest.create({
        data: {
          userId: user.id,
          amount: withdrawalAmount,
          upiId: parsed.data.upiId,
          status: "PENDING",
        }
      });

      // Deduct from balance immediately by creating a SUCCESS transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "WITHDRAWAL",
          amount: withdrawalAmount,
          status: "SUCCESS",
          relatedWithdrawalId: requestRow.id,
          note: `Withdrawal request to ${parsed.data.upiId}`
        }
      });

      return requestRow;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ withdrawal }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 400 });
    }
    return NextResponse.json({ error: "Withdrawal request could not be completed." }, { status: 500 });
  }
}
