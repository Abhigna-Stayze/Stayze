-- AlterEnum
ALTER TYPE "StayStatus" ADD VALUE 'HIDDEN';

-- AlterTable
ALTER TABLE "Stay" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "menuImageBucket" TEXT DEFAULT 'stays',
ADD COLUMN     "menuImagePath" TEXT;

-- CreateIndex
CREATE INDEX "Stay_deletedAt_idx" ON "Stay"("deletedAt");
