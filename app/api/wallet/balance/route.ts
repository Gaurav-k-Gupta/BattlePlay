import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getWalletBalance } from "@/lib/wallet-balance";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const balance = await getWalletBalance(user.id);
  return NextResponse.json({ balance: balance.toFixed(2) });
}
