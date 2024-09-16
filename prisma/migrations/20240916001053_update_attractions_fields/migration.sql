/*
  Warnings:

  - You are about to drop the column `duration` on the `Attraction` table. All the data in the column will be lost.
  - You are about to drop the column `maxPersons` on the `Attraction` table. All the data in the column will be lost.
  - You are about to drop the column `minAge` on the `Attraction` table. All the data in the column will be lost.
  - You are about to drop the column `recomended` on the `Attraction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attraction" DROP COLUMN "duration",
DROP COLUMN "maxPersons",
DROP COLUMN "minAge",
DROP COLUMN "recomended";
