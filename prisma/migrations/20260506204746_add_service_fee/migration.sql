-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'MIXED';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cardAmount" DOUBLE PRECISION,
ADD COLUMN     "cashAmount" DOUBLE PRECISION,
ADD COLUMN     "cashierName" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
