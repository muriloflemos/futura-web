-- CreateTable
CREATE TABLE `Carteira` (
    `id` INTEGER NOT NULL,
    `descricao` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Carteira.descricao_unique`(`descricao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modalidade` (
    `id` INTEGER NOT NULL,
    `descricao` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Modalidade.descricao_unique`(`descricao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
