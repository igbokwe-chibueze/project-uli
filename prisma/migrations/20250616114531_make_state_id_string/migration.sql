/*
  Warnings:

  - The primary key for the `states` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "states" DROP CONSTRAINT "states_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "states_pkey" PRIMARY KEY ("id");
