-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NOG_NIET_GESTUURD', 'TIKKIE_GESTUURD', 'BETAALD');

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NOG_NIET_GESTUURD',
ADD COLUMN     "phone" TEXT;
