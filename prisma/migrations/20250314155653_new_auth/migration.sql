/*
  Warnings:

  - You are about to drop the column `triggeredBy_id` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[google_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `triggered_by_id` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_triggeredBy_id_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_user_id_fkey";

-- DropIndex
DROP INDEX "User_googleId_key";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "triggeredBy_id",
ADD COLUMN     "triggered_by_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "googleId",
DROP COLUMN "googleImage",
ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "google_image" TEXT,
ADD COLUMN     "refresh_token" TEXT;

-- DropTable
DROP TABLE "RefreshToken";

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_triggered_by_id_fkey" FOREIGN KEY ("triggered_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
