-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "aiGaps" TEXT,
ADD COLUMN     "aiLastMatchedAt" TIMESTAMP(3),
ADD COLUMN     "aiMatchScore" INTEGER,
ADD COLUMN     "aiMatchSummary" TEXT,
ADD COLUMN     "aiMissingKeywords" TEXT,
ADD COLUMN     "aiStrengths" TEXT,
ADD COLUMN     "jobDescriptionText" TEXT,
ADD COLUMN     "resumeText" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Saved',
ALTER COLUMN "priority" SET DEFAULT 'Medium';

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
