-- DropForeignKey
ALTER TABLE `Cobranca` DROP FOREIGN KEY `Cobranca_ibfk_1`;

-- DropForeignKey
ALTER TABLE `Cobranca` DROP FOREIGN KEY `Cobranca_ibfk_2`;

-- DropForeignKey
ALTER TABLE `Inventario` DROP FOREIGN KEY `Inventario_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ProdutoInventario` DROP FOREIGN KEY `ProdutoInventario_ibfk_1`;

-- DropForeignKey
ALTER TABLE `ProdutoInventario` DROP FOREIGN KEY `ProdutoInventario_ibfk_2`;

-- DropForeignKey
ALTER TABLE `UsuarioEmpresa` DROP FOREIGN KEY `UsuarioEmpresa_ibfk_1`;

-- CreateTable
CREATE TABLE `Pagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `controle` VARCHAR(100) NOT NULL,
    `observacao` TEXT NULL,
    `id_usuario` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pagamento_controle_key`(`controle`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inventario` ADD CONSTRAINT `Inventario_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoInventario` ADD CONSTRAINT `ProdutoInventario_id_inventario_fkey` FOREIGN KEY (`id_inventario`) REFERENCES `Inventario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoInventario` ADD CONSTRAINT `ProdutoInventario_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsuarioEmpresa` ADD CONSTRAINT `UsuarioEmpresa_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranca` ADD CONSTRAINT `Cobranca_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cobranca` ADD CONSTRAINT `Cobranca_id_forma_pagamento_fkey` FOREIGN KEY (`id_forma_pagamento`) REFERENCES `FormaPagamento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Carteira` RENAME INDEX `Carteira.descricao_unique` TO `Carteira_descricao_key`;

-- RenameIndex
ALTER TABLE `Cobranca` RENAME INDEX `Cobranca.controle_unique` TO `Cobranca_controle_key`;

-- RenameIndex
ALTER TABLE `Modalidade` RENAME INDEX `Modalidade.descricao_unique` TO `Modalidade_descricao_key`;

-- RenameIndex
ALTER TABLE `ProdutoInventario` RENAME INDEX `unq_produto` TO `ProdutoInventario_id_produto_id_inventario_key`;

-- RenameIndex
ALTER TABLE `Usuario` RENAME INDEX `Usuario.login_unique` TO `Usuario_login_key`;
