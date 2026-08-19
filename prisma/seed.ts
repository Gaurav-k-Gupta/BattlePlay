import "dotenv/config";

import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    throw new Error("ADMIN_EMAIL must be set before seeding an admin user.");
  }

  const name = process.env.ADMIN_NAME?.trim() || "BattlePlay Admin";

  const admin = await prisma.user.upsert({
    where: { email },
    update: { name, role: "ADMIN" },
    create: { name, email, role: "ADMIN" },
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
