import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminRegistrationUpdateSchema } from "@/lib/validation/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);

  // Body should be { registrationId: string, verifiedByHost?: boolean, placement?: number }
  const data = body as any;
  if (!data || !data.registrationId) {
    return NextResponse.json({ error: "Missing registration ID" }, { status: 400 });
  }

  const parsed = adminRegistrationUpdateSchema.safeParse({
    verifiedByHost: data.verifiedByHost,
    placement: data.placement,
    finishes: data.finishes,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const updateData: any = {
      verifiedByHost: parsed.data.verifiedByHost,
      placement: parsed.data.placement,
    };
    if (parsed.data.finishes !== null && parsed.data.finishes !== undefined) {
      updateData.finishes = parsed.data.finishes;
    } else if (parsed.data.finishes === null) {
      updateData.finishes = 0;
    }

    const registration = await prisma.registration.update({
      where: { id: data.registrationId, matchId: id },
      data: updateData
    });
    return NextResponse.json({ registration }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}
