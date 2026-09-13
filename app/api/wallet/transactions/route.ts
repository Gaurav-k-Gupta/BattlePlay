import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionQuerySchema } from "@/lib/validation/wallet";

export async function GET(request: Request) {
  const parsed = transactionQuerySchema.safeParse({
    limit: new URL(request.url).searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid transaction query." }, { status: 400 });
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: parsed.data.limit,
    select: { id: true, type: true, amount: true, status: true, note: true, createdAt: true },
  });

  return NextResponse.json({
    transactions: transactions.map((transaction) => ({
      ...transaction,
      amount: transaction.amount.toFixed(2),
    })),
  });
}
