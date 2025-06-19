-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "stateId" TEXT,
ADD COLUMN     "streetAddress1" TEXT,
ADD COLUMN     "streetAddress2" TEXT;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
