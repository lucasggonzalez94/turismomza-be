/*
  Warnings:

  - You are about to drop the column `amount_paid` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `place_id` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `added_date` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `place_id` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `place_id` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `public_id` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `creation_date` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `review_id` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `creation_date` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `triggered_by_id` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `contact_number` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `creator_id` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `currency_price` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `public_id` on the `ProfilePicture` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `ProfilePicture` table. All the data in the column will be lost.
  - You are about to drop the column `report_date` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `review_id` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `creation_date` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `place_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_code` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_enabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_expires` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,placeId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,reviewId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `ProfilePicture` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amountPaid` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `triggeredById` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `ProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ProfilePicture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_place_id_fkey";

-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_place_id_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_place_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_triggered_by_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "ProfilePicture" DROP CONSTRAINT "ProfilePicture_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_place_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_user_id_fkey";

-- DropIndex
DROP INDEX "Favorite_user_id_place_id_key";

-- DropIndex
DROP INDEX "Like_user_id_review_id_key";

-- DropIndex
DROP INDEX "ProfilePicture_user_id_key";

-- DropIndex
DROP INDEX "User_google_id_key";

-- AlterTable
ALTER TABLE "Advertisement" DROP COLUMN "amount_paid",
DROP COLUMN "created_at",
DROP COLUMN "end_date",
DROP COLUMN "is_active",
DROP COLUMN "place_id",
DROP COLUMN "start_date",
DROP COLUMN "user_id",
ADD COLUMN     "amountPaid" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "placeId" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "added_date",
DROP COLUMN "place_id",
DROP COLUMN "user_id",
ADD COLUMN     "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "placeId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "place_id",
DROP COLUMN "public_id",
ADD COLUMN     "placeId" TEXT NOT NULL,
ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "creation_date",
DROP COLUMN "review_id",
DROP COLUMN "user_id",
ADD COLUMN     "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reviewId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "creation_date",
DROP COLUMN "triggered_by_id",
DROP COLUMN "user_id",
ADD COLUMN     "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "triggeredById" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "contact_number",
DROP COLUMN "created_at",
DROP COLUMN "creator_id",
DROP COLUMN "currency_price",
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "currencyPrice" "CurrencyType" DEFAULT 'ars';

-- AlterTable
ALTER TABLE "ProfilePicture" DROP COLUMN "public_id",
DROP COLUMN "user_id",
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "report_date",
DROP COLUMN "review_id",
DROP COLUMN "user_id",
ADD COLUMN     "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "reviewId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "creation_date",
DROP COLUMN "place_id",
DROP COLUMN "user_id",
ADD COLUMN     "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "placeId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "created_at",
DROP COLUMN "google_id",
DROP COLUMN "google_image",
DROP COLUMN "refresh_token",
DROP COLUMN "two_factor_code",
DROP COLUMN "two_factor_enabled",
DROP COLUMN "two_factor_expires",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "googleImage" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "twoFactorCode" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_placeId_key" ON "Favorite"("userId", "placeId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_reviewId_key" ON "Like"("userId", "reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePicture_userId_key" ON "ProfilePicture"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePicture" ADD CONSTRAINT "ProfilePicture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
