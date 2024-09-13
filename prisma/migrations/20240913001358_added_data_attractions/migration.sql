-- AlterTable
ALTER TABLE "Attraction" ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "maxPersons" INTEGER,
ADD COLUMN     "minAge" INTEGER,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "recomended" TEXT,
ADD COLUMN     "services" TEXT[],
ADD COLUMN     "timeClose" TEXT,
ADD COLUMN     "timeOpen" TEXT,
ADD COLUMN     "webSite" TEXT;
