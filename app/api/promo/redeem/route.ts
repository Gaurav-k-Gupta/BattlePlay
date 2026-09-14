import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const redeemSchema = z.object({
  code: z.string().min(1, "Promo code is required").toUpperCase()
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = redeemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const { code } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const promo = await tx.promoCode.findUnique({
        where: { code },
        include: { _count: { select: { redemptions: true } } }
      });

      if (!promo) throw new Error("INVALID_CODE");
      if (!promo.isActive) throw new Error("INACTIVE_CODE");
      if (promo.expiresAt && promo.expiresAt < new Date()) throw new Error("EXPIRED_CODE");
      if (promo.maxRedemptions && promo._count.redemptions >= promo.maxRedemptions) {
        throw new Error("FULLY_REDEEMED");
      }

      const existingRedemption = await tx.promoRedemption.findUnique({
        where: { userId_promoCodeId: { userId: user.id, promoCodeId: promo.id } }
      });
      if (existingRedemption) throw new Error("ALREADY_REDEEMED");

      // Record redemption
      await tx.promoRedemption.create({
        data: { userId: user.id, promoCodeId: promo.id }
      });

      // Credit wallet
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "PROMO_BONUS",
          amount: promo.bonusAmount,
          status: "SUCCESS",
          note: `Redeemed promo code: ${promo.code}`
        }
      });

      return promo.bonusAmount;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ message: `Successfully redeemed ₹${result.toFixed(0)}!` }, { status: 200 });
  } catch (error: any) {
    const msg = error.message;
    if (msg === "INVALID_CODE") return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    if (msg === "INACTIVE_CODE") return NextResponse.json({ error: "Promo code is inactive" }, { status: 400 });
    if (msg === "EXPIRED_CODE") return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
    if (msg === "FULLY_REDEEMED") return NextResponse.json({ error: "Promo code has reached its maximum redemptions" }, { status: 400 });
    if (msg === "ALREADY_REDEEMED") return NextResponse.json({ error: "You have already redeemed this code" }, { status: 400 });
    
    console.error("Failed to redeem promo code:", error);
    return NextResponse.json({ error: "Failed to redeem promo code" }, { status: 500 });
  }
}
