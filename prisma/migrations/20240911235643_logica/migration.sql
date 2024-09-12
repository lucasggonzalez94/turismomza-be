/*
  Warnings:

  - A unique constraint covering the columns `[userId,attractionId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_attractionId_key" ON "Favorite"("userId", "attractionId");
