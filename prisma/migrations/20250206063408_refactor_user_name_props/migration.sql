/*
  Warnings:

  - You are about to drop the column `attractionId` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `attractionId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `attractionId` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `attractionId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Attraction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,placeId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `placeId` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_attractionId_fkey";

-- DropForeignKey
ALTER TABLE "Attraction" DROP CONSTRAINT "Attraction_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_attractionId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_attractionId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_attractionId_fkey";

-- DropIndex
DROP INDEX "Favorite_userId_attractionId_key";

-- AlterTable
ALTER TABLE "Advertisement" DROP COLUMN "attractionId",
ADD COLUMN     "placeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "attractionId",
ADD COLUMN     "placeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "attractionId",
ADD COLUMN     "placeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "attractionId",
ADD COLUMN     "placeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Attraction";

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "services" TEXT[],
    "contactNumber" TEXT,
    "email" TEXT,
    "webSite" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "schedule" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "currencyPrice" "CurrencyType" DEFAULT 'ars',

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_slug_key" ON "Place"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_placeId_key" ON "Favorite"("userId", "placeId");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
