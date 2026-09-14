/*
  Warnings:

  - You are about to drop the column `maxSlots` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matchId,slotNumber]` on the table `Registration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lobbySize` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `map` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prizePerFinish` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rules` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `runnerUpPrize` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnerPrize` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotCount` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotNumber` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchCategory" AS ENUM ('FULL_MAP', 'CS', 'LW', 'HEAD', 'LW_HEAD', 'FREE');

-- CreateEnum
CREATE TYPE "MatchPaymentType" AS ENUM ('PAID', 'FREE');

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "maxSlots",
ADD COLUMN     "category" "MatchCategory" NOT NULL,
ADD COLUMN     "lobbySize" INTEGER NOT NULL,
ADD COLUMN     "map" TEXT NOT NULL,
ADD COLUMN     "paymentType" "MatchPaymentType" NOT NULL,
ADD COLUMN     "prizePerFinish" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "rules" TEXT NOT NULL,
ADD COLUMN     "runnerUpPrize" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "winnerPrize" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "slotCount" INTEGER NOT NULL,
ADD COLUMN     "slotNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Registration_matchId_idx" ON "Registration"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_matchId_slotNumber_key" ON "Registration"("matchId", "slotNumber");
