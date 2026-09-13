import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { topUpVerificationSchema } from "@/lib/validation/wallet";
import { reconcileTranzupiTopUp, type TopUpReconciliation } from "@/lib/wallet-topups";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = topUpVerificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment verification data." }, { status: 400 });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  let result: TopUpReconciliation;
  try {
    result = await reconcileTranzupiTopUp(parsed.data.orderId, user.id);
  } catch (error) {
    console.error("Unable to verify TranzUPI top-up", error);
    return NextResponse.json({ error: "Payment confirmation is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }

  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Top-up order was not found." }, { status: 404 });
  }
  if (result === "PENDING") return NextResponse.json({ status: "PENDING" });
  if (result === "FAILED") return NextResponse.json({ error: "Payment was not successful." }, { status: 409 });
  return NextResponse.json({ transactionId: parsed.data.orderId, status: "SUCCESS" });
}
