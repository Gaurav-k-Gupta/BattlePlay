import { z } from "zod";

export const topUpOrderSchema = z.object({
  amount: z.coerce.number().finite().multipleOf(1).min(10, "Minimum top-up is ₹10.").max(10_000, "Maximum top-up is ₹10,000."),
});

export const topUpVerificationSchema = z.object({
  orderId: z.string().trim().min(1).max(100),
});

export const tranzupiWebhookSchema = z.object({
  order_id: z.string().trim().min(1).max(100),
  amount: z.string().trim().min(1).max(30),
  customer_mobile: z.string().trim().min(10).max(20),
  status: z.string().trim().min(1).max(30),
  utr: z.string().trim().max(100).optional(),
});

export const transactionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
