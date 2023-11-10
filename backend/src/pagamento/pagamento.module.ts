import { Module } from '@nestjs/common';
import { DbService } from '../db.service';
import { OracleDbService } from '../oracle-db.service';
import { PagamentoService } from './pagamento.service';
import { PagamentoController } from './pagamento.controller';
import { ProvisaoService } from '../provisao/provisao.service';

@Module({
  controllers: [PagamentoController],
  providers: [PagamentoService, OracleDbService, DbService, ProvisaoService],
})
export class PagamentoModule {}
