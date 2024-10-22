/*
  Warnings:

  - The values [comment] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `commentId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `commentId` on the `Report` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,reviewId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reviewId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('review', 'like');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_commentId_fkey";

-- DropIndex
DROP INDEX "Like_userId_commentId_key";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "commentId",
ADD COLUMN     "reviewId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "commentId",
ADD COLUMN     "reviewId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_reviewId_key" ON "Like"("userId", "reviewId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
