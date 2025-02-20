-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "language" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "verified" BOOLEAN,
ADD COLUMN     "website" TEXT;
