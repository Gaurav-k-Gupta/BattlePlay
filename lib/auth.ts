import "server-only";

import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const currentUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  freeFireUID: true,
  freeFireIGN: true,
  role: true,
  isBanned: true,
  agreedToTerms: true,
  createdAt: true,
} as const;

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: currentUserSelect,
  });

  return user?.isBanned ? null : user;
});

export async function requirePageUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return user;
}

export async function isCurrentUserAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}
