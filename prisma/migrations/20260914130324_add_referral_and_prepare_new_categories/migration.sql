-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "referredById" INTEGER;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
