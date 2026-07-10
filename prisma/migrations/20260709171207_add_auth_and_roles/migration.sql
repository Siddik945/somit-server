/*
  Warnings:

  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[user_id,date]` on the table `kistis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `date` on table `kistis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total_due` on table `kistis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `jorimana` on table `kistis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `current_kisti` on table `kistis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `total` on table `kistis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `joma` on table `kistis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `current_due` on table `kistis` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');

-- AlterTable
ALTER TABLE "kistis" ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "total_due" SET NOT NULL,
ALTER COLUMN "total_due" SET DEFAULT 0,
ALTER COLUMN "jorimana" SET NOT NULL,
ALTER COLUMN "jorimana" SET DEFAULT 0,
ALTER COLUMN "current_kisti" SET NOT NULL,
ALTER COLUMN "current_kisti" SET DEFAULT 0,
ALTER COLUMN "total" SET NOT NULL,
ALTER COLUMN "total" SET DEFAULT 0,
ALTER COLUMN "joma" SET NOT NULL,
ALTER COLUMN "joma" SET DEFAULT 0,
ALTER COLUMN "current_due" SET NOT NULL,
ALTER COLUMN "current_due" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT,
ADD COLUMN     "password" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER';

-- CreateIndex
CREATE INDEX "kistis_date_idx" ON "kistis"("date");

-- CreateIndex
CREATE INDEX "kistis_amount_id_idx" ON "kistis"("amount_id");

-- CreateIndex
CREATE UNIQUE INDEX "kistis_user_id_date_key" ON "kistis"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
