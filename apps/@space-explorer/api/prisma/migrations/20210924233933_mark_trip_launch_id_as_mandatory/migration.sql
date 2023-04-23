/*
  Warnings:

  - Made the column `launchId` on table `Trip` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "launchId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("createdAt", "id", "launchId", "updatedAt", "userId") SELECT "createdAt", "id", "launchId", "updatedAt", "userId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
