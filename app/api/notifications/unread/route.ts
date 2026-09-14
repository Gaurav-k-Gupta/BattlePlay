import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 }, { status: 200 });

  const count = await prisma.notification.count({
    where: { userId: user.id, isRead: false }
  });

  return NextResponse.json({ count }, { status: 200 });
}
