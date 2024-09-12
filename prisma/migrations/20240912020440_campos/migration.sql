-- AlterTable
ALTER TABLE "User" ADD COLUMN     "two_factor_code" TEXT,
ADD COLUMN     "two_factor_expires" TIMESTAMP(3);
