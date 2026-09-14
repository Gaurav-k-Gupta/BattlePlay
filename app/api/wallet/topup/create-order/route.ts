import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTranzupiOrder } from "@/lib/tranzupi";
import { normalizeIndianMobile } from "@/lib/validation/profile";
import { topUpOrderSchema } from "@/lib/validation/wallet";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = topUpOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid top-up amount.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const mobile = normalizeIndianMobile(user.phone);

  if (!mobile) {
    return NextResponse.json({ error: "Add a valid 10-digit Indian mobile number to your profile before topping up.", profileUrl: "/profile" }, { status: 422 });
  }

  try {
    const amount = new Prisma.Decimal(parsed.data.amount).toDecimalPlaces(2);
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "TOPUP",
        amount,
        status: "PENDING",
        note: "TranzUPI top-up awaiting provider confirmation.",
      },
      select: { id: true },
    });
    const origin = process.env.NEXTAUTH_URL || (request.headers.get("origin") ?? `https://${request.headers.get("host")}`);
    const redirectUrl = new URL("/wallet", origin);
    redirectUrl.searchParams.set("topup", transaction.id);
    const order = await createTranzupiOrder({
      customerMobile: mobile,
      amount: amount.toFixed(2),
      orderId: transaction.id,
      redirectUrl: redirectUrl.toString(),
      customerName: user.name,
    });

    return NextResponse.json({
      orderId: order.orderId,
      paymentUrl: order.paymentUrl,
    });
  } catch (error) {
    console.error("Unable to create TranzUPI order", error);
    return NextResponse.json({ error: "We could not start this top-up. Please try again." }, { status: 502 });
  }
}
