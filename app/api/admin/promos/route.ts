import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminPromoSchema } from "@/lib/validation/admin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const parsed = adminPromoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: parsed.data.code,
        bonusAmount: parsed.data.bonusAmount,
        maxRedemptions: parsed.data.maxRedemptions || null,
        expiresAt: parsed.data.expiresAt || null,
        isActive: true,
      }
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });
    }
    console.error("Failed to create promo:", error);
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}
