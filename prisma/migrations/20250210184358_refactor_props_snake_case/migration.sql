/*
  Warnings:

  - You are about to drop the column `amountPaid` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `reviewId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `triggeredById` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `contactNumber` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `currencyPrice` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ProfilePicture` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `reviewId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,place_id]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,review_id]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `ProfilePicture` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount_paid` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_id` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_id` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_id` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `review_id` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggeredBy_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_id` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `review_id` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `place_id` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_userId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_triggeredById_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "ProfilePicture" DROP CONSTRAINT "ProfilePicture_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_placeId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropIndex
DROP INDEX "Favorite_userId_placeId_key";

-- DropIndex
DROP INDEX "Like_userId_reviewId_key";

-- DropIndex
DROP INDEX "ProfilePicture_userId_key";

-- DropIndex
DROP INDEX "RefreshToken_userId_idx";

-- DropIndex
DROP INDEX "RefreshToken_userId_key";

-- AlterTable
ALTER TABLE "Advertisement" DROP COLUMN "amountPaid",
DROP COLUMN "createdAt",
DROP COLUMN "endDate",
DROP COLUMN "isActive",
DROP COLUMN "placeId",
DROP COLUMN "startDate",
DROP COLUMN "userId",
ADD COLUMN     "amount_paid" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "place_id" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "placeId",
DROP COLUMN "userId",
ADD COLUMN     "place_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "placeId",
ADD COLUMN     "place_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "reviewId",
DROP COLUMN "userId",
ADD COLUMN     "review_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "triggeredById",
DROP COLUMN "userId",
ADD COLUMN     "triggeredBy_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "contactNumber",
DROP COLUMN "creatorId",
DROP COLUMN "currencyPrice",
ADD COLUMN     "contact_number" TEXT,
ADD COLUMN     "creator_id" TEXT NOT NULL,
ADD COLUMN     "currency_price" "CurrencyType" DEFAULT 'ars';

-- AlterTable
ALTER TABLE "ProfilePicture" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "reviewId",
DROP COLUMN "userId",
ADD COLUMN     "review_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "placeId",
DROP COLUMN "userId",
ADD COLUMN     "place_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_user_id_place_id_key" ON "Favorite"("user_id", "place_id");

-- CreateIndex
CREATE UNIQUE INDEX "Like_user_id_review_id_key" ON "Like"("user_id", "review_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePicture_user_id_key" ON "ProfilePicture"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_user_id_key" ON "RefreshToken"("user_id");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_idx" ON "RefreshToken"("user_id");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_triggeredBy_id_fkey" FOREIGN KEY ("triggeredBy_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePicture" ADD CONSTRAINT "ProfilePicture_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
