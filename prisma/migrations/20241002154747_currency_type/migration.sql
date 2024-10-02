-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('ars', 'usd');

-- AlterTable
ALTER TABLE "Attraction" ADD COLUMN     "currencyPrice" "CurrencyType";
