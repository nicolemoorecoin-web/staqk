-- AlterTable
ALTER TABLE "Tx" ADD COLUMN "asset" TEXT;
ALTER TABLE "Tx" ADD COLUMN "meta" JSONB;
ALTER TABLE "Tx" ADD COLUMN "network" TEXT;
ALTER TABLE "Tx" ADD COLUMN "receiptUrl" TEXT;

-- CreateTable
CREATE TABLE "DepositAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asset" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "memo" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "DepositAddress_asset_network_key" ON "DepositAddress"("asset", "network");
