import { adminMatchSchema, adminMatchEditSchema } from "./lib/validation/admin";

const data = {
  title: "Test Match",
  description: "",
  gameType: "SOLO",
  category: "FULL_MAP",
  paymentType: "PAID",
  map: "Bermuda",
  entryFee: 10,
  prizePool: 0,
  prizePerFinish: 0,
  winnerPrize: 0,
  runnerUpPrize: 0,
  lobbySize: 48,
  matchTime: "2026-09-15T15:30",
  rules: "1. No hackers\n2. Play fair",
  status: "UPCOMING",
  roomId: null,
  roomPassword: null,
  telegramGroupLink: null
};

console.log("Create:", adminMatchSchema.safeParse(data).error?.issues);
console.log("Edit:", adminMatchEditSchema.safeParse(data).error?.issues);
