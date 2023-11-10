-- CreateTable
CREATE TABLE `Cobranca` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `controle` DECIMAL(10, 0) NOT NULL,
    `programacao` DATETIME(3),
    `id_forma_pagamento` INTEGER,
    `pontualidade` VARCHAR(1),
    `cobranca_preventiva` INTEGER,
    `status_cobranca` INTEGER,
    `observacao` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cobranca.controle_unique`(`controle`),
    INDEX `id_forma_pagamento`(`id_forma_pagamento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cobranca` ADD FOREIGN KEY (`id_forma_pagamento`) REFERENCES `FormaPagamento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
