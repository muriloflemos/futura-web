import { Controller, Get } from '@nestjs/common';
import { ModalidadeService } from './modalidade.service';

@Controller('modalidade')
export class ModalidadeController {
  constructor(private readonly modalidadeService: ModalidadeService) {}

  @Get()
  findAll() {
    return this.modalidadeService.findAll();
  }

  @Get('futura')
  findAllFutura() {
    return this.modalidadeService.findAllFutura();
  }
}
