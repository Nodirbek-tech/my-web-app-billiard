-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "bonusEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "bonusRedeemed" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "customerId" INTEGER;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "customerId" INTEGER;

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "bonusBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "telegramId" TEXT,
    "telegramUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerVisit" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "playCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonusRedeemed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "cashbackPercent" DOUBLE PRECISION NOT NULL DEFAULT 5,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cardNumber_key" ON "Customer"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_telegramId_key" ON "Customer"("telegramId");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_cardNumber_idx" ON "Customer"("cardNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerVisit_sessionId_key" ON "CustomerVisit"("sessionId");

-- CreateIndex
CREATE INDEX "CustomerVisit_customerId_idx" ON "CustomerVisit"("customerId");

-- CreateIndex
CREATE INDEX "Payment_customerId_idx" ON "Payment"("customerId");

-- CreateIndex
CREATE INDEX "Session_customerId_idx" ON "Session"("customerId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVisit" ADD CONSTRAINT "CustomerVisit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVisit" ADD CONSTRAINT "CustomerVisit_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
