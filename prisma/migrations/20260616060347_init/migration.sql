/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amounts" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3),
    "amount" INTEGER,
    "status" TEXT,

    CONSTRAINT "amounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kistis" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "total_due" INTEGER,
    "jorimana" INTEGER,
    "current_kisti" INTEGER,
    "total" INTEGER,
    "joma" INTEGER,
    "current_due" INTEGER,

    CONSTRAINT "kistis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "kistis" ADD CONSTRAINT "kistis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kistis" ADD CONSTRAINT "kistis_amount_id_fkey" FOREIGN KEY ("amount_id") REFERENCES "amounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
