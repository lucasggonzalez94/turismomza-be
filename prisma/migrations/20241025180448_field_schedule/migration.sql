/*
  Warnings:

  - You are about to drop the column `timeClose` on the `Attraction` table. All the data in the column will be lost.
  - You are about to drop the column `timeOpen` on the `Attraction` table. All the data in the column will be lost.
  - Added the required column `schedule` to the `Attraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attraction" DROP COLUMN "timeClose",
DROP COLUMN "timeOpen",
ADD COLUMN     "schedule" TEXT NOT NULL;
