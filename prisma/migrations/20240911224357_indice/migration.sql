/*
  Warnings:

  - A unique constraint covering the columns `[userId,commentId]` on the table `LikeDislike` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LikeDislike_userId_commentId_key" ON "LikeDislike"("userId", "commentId");
