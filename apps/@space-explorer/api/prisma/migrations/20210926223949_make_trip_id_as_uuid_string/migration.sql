/*
  Warnings:

  - The primary key for the `Trip` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "launchId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("createdAt", "id", "launchId", "updatedAt", "userId") SELECT "createdAt", "id", "launchId", "updatedAt", "userId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
CREATE UNIQUE INDEX "Trip_launchId_key" ON "Trip"("launchId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
