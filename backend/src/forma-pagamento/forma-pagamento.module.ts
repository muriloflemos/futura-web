import { Module } from '@nestjs/common';
import { DbService } from '../db.service';
import { FormaPagamentoService } from './forma-pagamento.service';
import { FormaPagamentoController } from './forma-pagamento.controller';

@Module({
  controllers: [FormaPagamentoController],
  providers: [DbService, FormaPagamentoService],
})
export class FormaPagamentoModule {}
