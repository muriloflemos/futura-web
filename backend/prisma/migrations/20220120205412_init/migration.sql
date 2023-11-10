-- CreateTable
CREATE TABLE `Inventario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `data` DATETIME(0) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `id_empresa` INTEGER NOT NULL,
    `tipo_estoque` INTEGER NOT NULL,

    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProdutoInventario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produto` INTEGER NOT NULL,
    `id_inventario` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `unidade` VARCHAR(30) NOT NULL,
    `quantidade_estoque` DECIMAL(15, 2) NOT NULL,
    `quantidade_contada` DECIMAL(15, 2) NOT NULL,

    UNIQUE INDEX `unq_produto`(`id_produto`, `id_inventario`),
    INDEX `id_inventario`(`id_inventario`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `login` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(50) NOT NULL,
    `tipo` VARCHAR(50) NOT NULL,
    `id_empresa` INTEGER,
    `tipo_estoque` INTEGER,

    UNIQUE INDEX `Usuario.login_unique`(`login`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inventario` ADD FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoInventario` ADD FOREIGN KEY (`id_inventario`) REFERENCES `Inventario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoInventario` ADD FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
