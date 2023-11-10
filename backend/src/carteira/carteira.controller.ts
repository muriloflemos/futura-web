import { Controller, Get } from '@nestjs/common';
import { CarteiraService } from './carteira.service';

@Controller('carteira')
export class CarteiraController {
  constructor(private readonly carteiraService: CarteiraService) {}

  @Get()
  findAll() {
    return this.carteiraService.findAll();
  }

  @Get('futura')
  findAllFutura() {
    return this.carteiraService.findAllFutura();
  }
}
