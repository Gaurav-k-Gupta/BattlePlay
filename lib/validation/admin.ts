import { z } from "zod";
import { GameType, MatchCategory, MatchPaymentType, MatchStatus, WithdrawalStatus } from "@/generated/prisma/client";

export const adminMatchSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional().nullable(),
  gameType: z.nativeEnum(GameType),
  category: z.nativeEnum(MatchCategory),
  paymentType: z.nativeEnum(MatchPaymentType),
  map: z.string().min(1, "Map is required."),
  entryFee: z.coerce.number().min(0, "Entry fee cannot be negative."),
  prizePool: z.coerce.number().min(0),
  prizePerFinish: z.coerce.number().min(0),
  winnerPrize: z.coerce.number().min(0),
  runnerUpPrize: z.coerce.number().min(0),
  lobbySize: z.coerce.number().min(2, "Lobby size must be at least 2."),
  matchTime: z.coerce.date(),
  rules: z.string().min(5, "Rules must be specified."),
});

export const adminMatchEditSchema = adminMatchSchema.extend({
  status: z.nativeEnum(MatchStatus),
  roomId: z.string().optional().nullable(),
  roomPassword: z.string().optional().nullable(),
  telegramGroupLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
});

export const adminRegistrationUpdateSchema = z.object({
  verifiedByHost: z.boolean(),
  placement: z.coerce.number().min(1).optional().nullable(),
  finishes: z.coerce.number().min(0).optional().nullable(),
});

export const adminWithdrawalActionSchema = z.object({
  status: z.nativeEnum(WithdrawalStatus),
  adminNote: z.string().optional().nullable(),
});

export const adminPromoSchema = z.object({
  code: z.string().min(3, "Promo code must be at least 3 characters").toUpperCase(),
  bonusAmount: z.coerce.number().min(1, "Bonus amount must be at least 1"),
  maxRedemptions: z.coerce.number().min(0).optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
});
