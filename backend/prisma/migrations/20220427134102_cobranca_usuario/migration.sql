/*
  Warnings:

  - Added the required column `id_usuario` to the `Cobranca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cobranca` ADD COLUMN `id_usuario` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `id_usuario` ON `Cobranca`(`id_usuario`);

-- AddForeignKey
ALTER TABLE `Cobranca` ADD FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
