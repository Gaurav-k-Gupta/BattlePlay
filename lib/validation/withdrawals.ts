import { z } from "zod";

export const withdrawalRequestSchema = z.object({
  amount: z.coerce
    .number()
    .min(50, "The minimum withdrawal amount is ₹50.")
    .int("Amount must be an integer (no decimals)."),
  upiId: z.string()
    .trim()
    .min(5, "Enter a valid UPI ID.")
    .regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID format (e.g., name@upi)"),
});
