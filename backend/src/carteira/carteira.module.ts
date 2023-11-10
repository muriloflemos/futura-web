import { Module } from '@nestjs/common';
import { DbService } from '../db.service';
import { OracleDbService } from '../oracle-db.service';

import { CarteiraService } from './carteira.service';
import { CarteiraController } from './carteira.controller';

@Module({
  controllers: [CarteiraController],
  providers: [CarteiraService, DbService, OracleDbService],
})
export class CarteiraModule {}
