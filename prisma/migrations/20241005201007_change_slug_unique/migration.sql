/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Attraction` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `Attraction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Attraction" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attraction_slug_key" ON "Attraction"("slug");
