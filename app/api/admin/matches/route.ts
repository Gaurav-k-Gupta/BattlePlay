import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminMatchSchema } from "@/lib/validation/admin";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = adminMatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid match data", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const match = await prisma.match.create({
      data: {
        ...parsed.data,
        createdBy: user.id, // Audit trail
      }
    });

    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}
