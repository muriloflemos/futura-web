import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  Put,
  Body,
} from '@nestjs/common';
import { Usuario } from '@prisma/client';

import { GetUser } from '../users/user.decorator';
import { PagamentoService } from './pagamento.service';
import { PagamentoDTO } from './dto/pagamento.dto';
import { FindPagamentoDTO } from './dto/find-pagamento.dto';
import { SavePagamentoDTO } from './dto/save-pagamento.dto';
import { TotalizadorDTO } from '../dtos/totalizador.dto';

@Controller('pagamento')
export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() params: FindPagamentoDTO): Promise<PagamentoDTO[]> {
    return await this.pagamentoService.findAll(params);
  }

  @Put()
  async save(
    @GetUser() usuario: Usuario,
    @Body() body: SavePagamentoDTO,
  ): Promise<PagamentoDTO[]> {
    return await this.pagamentoService.save(body, usuario);
  }

  @Get('resumo/pagamentos')
  async getResumoVencimentos(
    @Query() params: FindPagamentoDTO,
  ): Promise<TotalizadorDTO[]> {
    return await this.pagamentoService.getResumoPagamentos(params);
  }

  @Get('resumo/mensal')
  async getResumoMensal(
    @Query() params: FindPagamentoDTO,
  ): Promise<TotalizadorDTO[]> {
    return await this.pagamentoService.getResumoMensal(params);
  }
}
