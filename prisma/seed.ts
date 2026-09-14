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

  const templates = [
    ["Full Map Solo", "FULL_MAP", "SOLO", 8, 48, 7, 25, 7], ["Full Map Duo", "FULL_MAP", "DUO", 8, 48, 7, 25, 7],
    ["CS 1v1", "CS", "SOLO", 25, 2, 0, 40, 0], ["CS 2v2", "CS", "DUO", 15, 4, 0, 40, 0],
    ["LW 1v1", "LW", "SOLO", 25, 2, 0, 40, 0], ["LW 2v2", "LW", "DUO", 15, 4, 0, 40, 0],
    ["Head 1v1", "HEAD", "SOLO", 25, 2, 0, 40, 0], ["Head 2v2", "HEAD", "DUO", 15, 4, 0, 40, 0],
    ["LW Head 1v1", "LW_HEAD", "SOLO", 25, 2, 0, 40, 0], ["Free", "FREE", "SOLO", 0, 300, 0, 25, 0],
  ] as const;
  const now = new Date();
  let scheduledMatches = 0;
  for (let day = 0; day < 2; day += 1) for (let hour = 9; hour <= 23; hour += 1) for (const minute of [0, 30]) {
    if (hour === 23 && minute === 30) continue;
    const matchTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hour, minute);
    for (const [title, category, gameType, entryFee, lobbySize, prizePerFinish, winnerPrize, runnerUpPrize] of templates) {
      await prisma.match.upsert({ where: { id: `seed-${day}-${hour}-${minute}-${title.replaceAll(" ", "-")}` }, update: {}, create: { id: `seed-${day}-${hour}-${minute}-${title.replaceAll(" ", "-")}`, title, category, gameType, paymentType: entryFee === 0 ? "FREE" : "PAID", map: category === "FULL_MAP" || category === "FREE" ? "Bermuda" : "Clash Squad", entryFee, prizePool: winnerPrize + runnerUpPrize, prizePerFinish, winnerPrize, runnerUpPrize, lobbySize, matchTime, description: `${title} competitive lobby.`, rules: "Fair play required. Room details open 30 minutes before the match." } });
      scheduledMatches += 1;
    }
  }
  console.log(`Seeded or confirmed ${scheduledMatches} scheduled matches.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
