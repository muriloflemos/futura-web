import { Module } from '@nestjs/common';
import { DbService } from '../db.service';
import { OracleDbService } from '../oracle-db.service';

import { ModalidadeService } from './modalidade.service';
import { ModalidadeController } from './modalidade.controller';

@Module({
  controllers: [ModalidadeController],
  providers: [ModalidadeService, DbService, OracleDbService],
})
export class ModalidadeModule {}
