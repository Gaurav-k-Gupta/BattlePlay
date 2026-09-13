import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validation/profile";

function unauthorizedResponse() {
  return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorizedResponse();
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile data.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      freeFireUID: true,
      freeFireIGN: true,
      role: true,
      agreedToTerms: true,
    },
  });

  return NextResponse.json({ user: updatedUser });
}
