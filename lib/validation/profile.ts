import { z } from "zod";

const optionalText = (label: string, maxLength: number) =>
  z.string().trim().min(1, `${label} cannot be empty.`).max(maxLength, `${label} is too long.`).nullable();

export function normalizeIndianMobile(phone: string | null | undefined) {
  if (!phone) return null;

  const compact = phone.trim().replace(/[\s-]/g, "");
  const withoutCountryCode = compact.startsWith("+91") ? compact.slice(3) : compact.startsWith("91") && compact.length === 12 ? compact.slice(2) : compact;

  return /^[6-9]\d{9}$/.test(withoutCountryCode) ? withoutCountryCode : null;
}

const phoneSchema = z.string().trim().transform((phone, context) => {
  const normalized = normalizeIndianMobile(phone);

  if (!normalized) {
    context.addIssue({ code: "custom", message: "Enter a valid 10-digit Indian mobile number." });
    return z.NEVER;
  }

  return normalized;
}).nullable();

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long."),
  phone: phoneSchema,
  freeFireUID: optionalText("Free Fire UID", 40),
  freeFireIGN: optionalText("Free Fire IGN", 40),
});

export const termsAcceptanceSchema = z.object({
  agreedToTerms: z.literal(true),
});
