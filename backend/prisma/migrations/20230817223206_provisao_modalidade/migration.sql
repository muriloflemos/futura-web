/*
  Warnings:

  - Added the required column `id_modalidade` to the `Provisao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Provisao` ADD COLUMN `id_modalidade` INTEGER NOT NULL;
