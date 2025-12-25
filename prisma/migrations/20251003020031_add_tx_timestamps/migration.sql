/*
  Warnings:

  - You are about to drop the column `meta` on the `Tx` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Tx` table. All the data in the column will be lost.
  - You are about to drop the column `ts` on the `Tx` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tx" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tx_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tx" ("amount", "currency", "id", "status", "title", "type", "walletId") SELECT "amount", "currency", "id", "status", "title", "type", "walletId" FROM "Tx";
DROP TABLE "Tx";
ALTER TABLE "new_Tx" RENAME TO "Tx";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
