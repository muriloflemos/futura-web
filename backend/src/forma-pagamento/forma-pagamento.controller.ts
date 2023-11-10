import { Controller, Get } from '@nestjs/common';
import { FormaPagamentoService } from './forma-pagamento.service';

@Controller('forma-pagamento')
export class FormaPagamentoController {
  constructor(private readonly formaPagamentoService: FormaPagamentoService) {}

  @Get()
  findAll() {
    return this.formaPagamentoService.findAll();
  }
}
