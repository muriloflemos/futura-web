import { Module } from '@nestjs/common';
import { DbService } from '../db.service';
import { OracleDbService } from '../oracle-db.service';
import { CobrancaController } from './cobranca.controller';
import { CobrancaService } from './cobranca.service';

@Module({
  controllers: [CobrancaController],
  providers: [CobrancaService, OracleDbService, DbService],
})
export class CobrancaModule {}
