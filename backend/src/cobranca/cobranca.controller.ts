import {
  Controller,
  Get,
  Put,
  Query,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Usuario } from '@prisma/client';

import { GetUser } from '../users/user.decorator';
import { CobrancaService } from './cobranca.service';
import { FindCobrancaDTO } from './dto/find-cobranca.dto';
import { SaveCobrancaDTO } from './dto/save-cobranca.dto';
import { CobrancaDTO } from './dto/cobranca.dto';
import { TotalizadorDTO } from './dto/totalizador.dto';

@Controller('cobranca')
export class CobrancaController {
  constructor(private readonly cobrancaService: CobrancaService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() params: FindCobrancaDTO): Promise<CobrancaDTO[]> {
    return await this.cobrancaService.findAll(params);
  }

  @Put()
  async save(
    @GetUser() usuario: Usuario,
    @Body() body: SaveCobrancaDTO,
  ): Promise<CobrancaDTO[]> {
    return await this.cobrancaService.save(body, usuario);
  }

  @Get('totais')
  async findTotais(
    @Query() params: FindCobrancaDTO,
  ): Promise<TotalizadorDTO[]> {
    return await this.cobrancaService.findTotais(params);
  }

  @Get('devedores')
  async findDevedores(
    @Query() params: FindCobrancaDTO,
  ): Promise<TotalizadorDTO[]> {
    return await this.cobrancaService.findDevedores(params);
  }

  @Get('resumo/vencimentos')
  async getResumoVencimentos(
    @Query() params: FindCobrancaDTO,
  ): Promise<TotalizadorDTO[]> {
    return await this.cobrancaService.getResumoVencimentos(params);
  }

  @Get('resumo/mensal')
  async getResumoMensal(
    @Query() params: FindCobrancaDTO,
  ): Promise<TotalizadorDTO[]> {
    return await this.cobrancaService.getResumoMensal(params);
  }
}
