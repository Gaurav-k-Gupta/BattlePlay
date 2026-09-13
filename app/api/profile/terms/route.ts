import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { termsAcceptanceSchema } from "@/lib/validation/profile";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = termsAcceptanceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "You must explicitly accept the terms." }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { agreedToTerms: true },
    select: { agreedToTerms: true },
  });

  return NextResponse.json({ user: updatedUser });
}
