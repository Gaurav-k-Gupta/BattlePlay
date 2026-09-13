import "server-only";

import { cache } from "react";

import { Prisma, type TxType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const credits = new Set<TxType>(["TOPUP", "WINNINGS", "PROMO_BONUS", "REFERRAL_BONUS", "REFUND"]);

export const getWalletBalance = cache(async (userId: string) => {
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, status: "SUCCESS" },
    _sum: { amount: true },
  });

  return totals.reduce((balance, total) => {
    const amount = total._sum.amount ?? new Prisma.Decimal(0);
    return credits.has(total.type) ? balance.plus(amount) : balance.minus(amount);
  }, new Prisma.Decimal(0));
});
