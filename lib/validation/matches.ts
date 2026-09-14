import { z } from "zod";

export const matchQuerySchema = z.object({
  gameType: z.enum(["SOLO", "DUO", "SQUAD"]).optional(),
  paymentType: z.enum(["PAID", "FREE"]).optional(),
  status: z.enum(["UPCOMING", "LIVE", "COMPLETED", "CANCELLED"]).optional(),
});

export const registrationSchema = z.object({ slotNumber: z.coerce.number().int().positive() });
