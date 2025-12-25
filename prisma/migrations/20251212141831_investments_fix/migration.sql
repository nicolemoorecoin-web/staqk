-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "principal" DECIMAL NOT NULL DEFAULT 0,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "pnl" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startTs" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" DATETIME NOT NULL,
    CONSTRAINT "Investment_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Investment" ("balance", "currency", "id", "lastUpdate", "name", "pnl", "principal", "productId", "startTs", "status", "strategy", "walletId") SELECT "balance", "currency", "id", "lastUpdate", "name", "pnl", "principal", "productId", "startTs", "status", "strategy", "walletId" FROM "Investment";
DROP TABLE "Investment";
ALTER TABLE "new_Investment" RENAME TO "Investment";
CREATE INDEX "Investment_walletId_startTs_idx" ON "Investment"("walletId", "startTs");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
