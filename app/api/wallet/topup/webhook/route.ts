import { NextResponse } from "next/server";

import { tranzupiWebhookSchema } from "@/lib/validation/wallet";
import { reconcileTranzupiTopUp } from "@/lib/wallet-topups";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const parsed = tranzupiWebhookSchema.safeParse(formData ? Object.fromEntries(formData) : null);

  if (!parsed.success) return new NextResponse("Invalid webhook payload.", { status: 400 });

  try {
    const result = await reconcileTranzupiTopUp(parsed.data.order_id);

    if (result === "PENDING") return new NextResponse("Payment not confirmed yet.", { status: 503 });
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Unable to reconcile TranzUPI webhook", error);
    return new NextResponse("Verification unavailable.", { status: 503 });
  }
}
