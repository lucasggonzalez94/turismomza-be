/*
  Warnings:

  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_code` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_enabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_expires` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "googleImage",
DROP COLUMN "two_factor_code",
DROP COLUMN "two_factor_enabled",
DROP COLUMN "two_factor_expires",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "twoFactorCode" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
