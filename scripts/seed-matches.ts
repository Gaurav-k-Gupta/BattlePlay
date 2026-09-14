import "dotenv/config";
import { MatchCategory, GameType, MatchPaymentType } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";


const MATCH_TEMPLATES = [
  {
    title: "Bermuda Solo Brawl",
    category: MatchCategory.FULL_MAP,
    gameType: GameType.SOLO,
    paymentType: MatchPaymentType.PAID,
    map: "Bermuda",
    entryFee: 8,
    prizePool: 0,
    prizePerFinish: 7,
    winnerPrize: 25,
    runnerUpPrize: 7,
    lobbySize: 48,
    rules: "1. No teaming up.\n2. No hacks or third-party apps.\n3. Room details will be provided 15 mins before start.",
  },
  {
    title: "Purgatory Duo Clash",
    category: MatchCategory.FULL_MAP,
    gameType: GameType.DUO,
    paymentType: MatchPaymentType.PAID,
    map: "Purgatory",
    entryFee: 8,
    prizePool: 0,
    prizePerFinish: 7,
    winnerPrize: 25,
    runnerUpPrize: 7,
    lobbySize: 48,
    rules: "1. No teaming up with other duos.\n2. No hacks or third-party apps.",
  },
  {
    title: "Clash Squad 1v1",
    category: MatchCategory.CS,
    gameType: GameType.SOLO,
    paymentType: MatchPaymentType.PAID,
    map: "Bermuda Remastered",
    entryFee: 25,
    prizePool: 0,
    prizePerFinish: 0,
    winnerPrize: 40,
    runnerUpPrize: 0,
    lobbySize: 2,
    rules: "1. Standard Clash Squad rules.\n2. First to 7 wins.",
  },
  {
    title: "Clash Squad 2v2",
    category: MatchCategory.CS,
    gameType: GameType.DUO,
    paymentType: MatchPaymentType.PAID,
    map: "Bermuda",
    entryFee: 15,
    prizePool: 0,
    prizePerFinish: 0,
    winnerPrize: 40,
    runnerUpPrize: 0,
    lobbySize: 4,
    rules: "1. Standard Clash Squad rules.\n2. First to 7 wins.",
  },
  {
    title: "Lone Wolf 1v1",
    category: MatchCategory.LW,
    gameType: GameType.SOLO,
    paymentType: MatchPaymentType.PAID,
    map: "Iron Cage",
    entryFee: 25,
    prizePool: 0,
    prizePerFinish: 0,
    winnerPrize: 40,
    runnerUpPrize: 0,
    lobbySize: 2,
    rules: "1. Standard Lone Wolf rules.",
  },
  {
    title: "Lone Wolf 2v2",
    category: MatchCategory.LW,
    gameType: GameType.DUO,
    paymentType: MatchPaymentType.PAID,
    map: "Iron Cage",
    entryFee: 15,
    prizePool: 0,
    prizePerFinish: 0,
    winnerPrize: 40,
    runnerUpPrize: 0,
    lobbySize: 4,
    rules: "1. Standard Lone Wolf rules.",
  },
  {
    title: "Headshot Only 1v1",
    category: MatchCategory.HEAD,
    gameType: GameType.SOLO,
    paymentType: MatchPaymentType.PAID,
    map: "Bermuda",
    entryFee: 25,
    prizePool: 0,
    prizePerFinish: 0,
    winnerPrize: 40,
    runnerUpPrize: 0,
    lobbySize: 2,
    rules: "1. Headshots only. Body shots will not count.\n2. Desert Eagle only.",
  },
  {
    title: "Headshot Only 2v2",
    category: MatchCategory.HEAD,
    gameType: GameType.DUO,
    paymentType: MatchPaymentType.PAID,
    map: "Bermuda",
    entryFee: 15,
    prizePool: 0,
    prizePerFinish: 0,
    winnerPrize: 40,
    runnerUpPrize: 0,
    lobbySize: 4,
    rules: "1. Headshots only. Body shots will not count.",
  },
  {
    title: "LW Headshot 1v1",
    category: MatchCategory.LW_HEAD,
    gameType: GameType.SOLO,
    paymentType: MatchPaymentType.PAID,
    map: "Iron Cage",
    entryFee: 25,
    prizePool: 0,
    prizePerFinish: 0,
    winnerPrize: 40,
    runnerUpPrize: 0,
    lobbySize: 2,
    rules: "1. Lone Wolf mode.\n2. Headshots only.",
  },
  {
    title: "Mega Free Fire 300",
    category: MatchCategory.FREE,
    gameType: GameType.SOLO,
    paymentType: MatchPaymentType.FREE,
    map: "Kalahari",
    entryFee: 0,
    prizePool: 0,
    prizePerFinish: 0,
    winnerPrize: 25,
    runnerUpPrize: 0,
    lobbySize: 300,
    rules: "1. Massive lobby!\n2. Last man standing wins the prize.",
  },
];

async function main() {
  console.log("Seeding upcoming matches...");

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const datesToSeed = [startOfDay, new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)]; // Today and Tomorrow

  let createdCount = 0;

  for (const date of datesToSeed) {
    // From 9 AM to 11 PM (23:00) every 30 minutes
    for (let hour = 9; hour <= 23; hour++) {
      for (const minute of [0, 30]) {
        const matchTime = new Date(date);
        matchTime.setHours(hour, minute, 0, 0);

        // Don't create matches in the past
        if (matchTime < now) continue;

        // Check if matches already exist for this time
        const existing = await prisma.match.findFirst({
          where: { matchTime },
        });

        if (existing) continue;

        // Insert matches
        const matchesToInsert = MATCH_TEMPLATES.map((t) => ({
          ...t,
          matchTime,
          status: "UPCOMING" as const,
        }));

        await prisma.match.createMany({
          data: matchesToInsert,
        });

        createdCount += matchesToInsert.length;
      }
    }
  }

  console.log(`Successfully seeded ${createdCount} matches.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
