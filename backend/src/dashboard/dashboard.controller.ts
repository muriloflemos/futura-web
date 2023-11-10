import { Controller, Get, Query } from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { FindTotaisDTO } from './dto/find-totais.dto';
import { TotalizadorDTO } from './dto/totalizador.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('totais/vencer')
  async findTotaisVencer(
    @Query() params: FindTotaisDTO,
  ): Promise<TotalizadorDTO[]> {
    return await this.dashboardService.findTotaisVencer(params);
  }

  @Get('totais/vencidos')
  async findTotaisVencidos(
    @Query() params: FindTotaisDTO,
  ): Promise<TotalizadorDTO[]> {
    return await this.dashboardService.findTotaisVencidos(params);
  }
}
