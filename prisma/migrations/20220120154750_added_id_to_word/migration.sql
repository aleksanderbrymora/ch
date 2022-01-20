/*
  Warnings:

  - The primary key for the `Word` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Word` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Word_content_key";

-- AlterTable
ALTER TABLE "Word" DROP CONSTRAINT "Word_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Word_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Word_id_key" ON "Word"("id");
