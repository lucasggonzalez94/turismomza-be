/*
  Warnings:

  - A unique constraint covering the columns `[userId,attractionId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rating_userId_attractionId_key" ON "Rating"("userId", "attractionId");
