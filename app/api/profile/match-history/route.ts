import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  const registrations = await prisma.registration.findMany({
    where: { userId: user.id },
    orderBy: { registeredAt: "desc" },
    select: {
      id: true,
      freeFireIGNUsed: true,
      placement: true,
      winningsCredited: true,
      registeredAt: true,
      match: {
        select: {
          id: true,
          title: true,
          gameType: true,
          matchTime: true,
          status: true,
        },
      },
    },
  });

  return NextResponse.json({ registrations });
}
