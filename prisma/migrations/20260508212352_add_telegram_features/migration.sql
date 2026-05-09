-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable: Customer — add qrCodeValue
ALTER TABLE "Customer" ADD COLUMN "qrCodeValue" TEXT;

-- AlterTable: BusinessSettings — add address and contactPhone
ALTER TABLE "BusinessSettings" ADD COLUMN "address" TEXT NOT NULL DEFAULT 'Manzil ko''rsatilmagan';
ALTER TABLE "BusinessSettings" ADD COLUMN "contactPhone" TEXT NOT NULL DEFAULT '+998 XX XXX XX XX';

-- CreateTable: Reservation
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "peopleCount" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Promotion
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PromotionSendLog
CREATE TABLE "PromotionSendLog" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Customer_qrCodeValue_key (unique)
CREATE UNIQUE INDEX "Customer_qrCodeValue_key" ON "Customer"("qrCodeValue");

-- CreateIndex: Customer_telegramId_idx (non-unique, for @@index)
CREATE INDEX "Customer_telegramId_idx" ON "Customer"("telegramId");

-- CreateIndex: Reservation
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");
CREATE INDEX "Reservation_date_idx" ON "Reservation"("date");
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");

-- CreateIndex: PromotionSendLog
CREATE UNIQUE INDEX "PromotionSendLog_promotionId_customerId_key" ON "PromotionSendLog"("promotionId", "customerId");
CREATE INDEX "PromotionSendLog_promotionId_idx" ON "PromotionSendLog"("promotionId");
CREATE INDEX "PromotionSendLog_customerId_idx" ON "PromotionSendLog"("customerId");

-- AddForeignKey: Reservation → Customer
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: PromotionSendLog → Promotion
ALTER TABLE "PromotionSendLog" ADD CONSTRAINT "PromotionSendLog_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
