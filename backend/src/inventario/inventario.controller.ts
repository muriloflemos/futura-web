import {
  Controller,
  Request,
  Post,
  Get,
  Query,
  Body,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Inventario, ProdutoInventario, Usuario } from '@prisma/client';
import { startOfToday, endOfToday } from 'date-fns';

import { GetUser } from '../users/user.decorator';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { AddProdutoInventarioDto } from './dto/add-produto-inventario.dto';
import { StatusInventario } from './status-inventario.enum';
import { InventarioService } from './inventario.service';
import { EmpresaService } from '../empresa/empresa.service';
import { Empresa } from '../empresa/empresa';
import { UsersService } from '../users/users.service';

@Controller('inventario')
export class InventarioController {
  private readonly logger = new Logger(InventarioController.name);

  constructor(
    private readonly inventarioService: InventarioService,
    private readonly empresaService: EmpresaService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(
    @Query() query: any,
    @GetUser() usuario: Usuario,
  ): Promise<Inventario[]> {
    const status = query?.status || [
      StatusInventario.ABERTO,
      StatusInventario.FINALIZADO,
    ];
    const dataInicio = query?.dataInicio
      ? new Date(query.dataInicio)
      : startOfToday();
    const dataFim = query?.dataFim ? new Date(query.dataFim) : endOfToday();
    const usuarioEmpresas = await this.usersService.getEmpresas(usuario.id);
    const inventarios = await this.inventarioService.findAll(
      status,
      dataInicio,
      dataFim,
      usuario,
      usuarioEmpresas,
    );
    const empresas = await this.empresaService.findAll();
    return inventarios.map((inventario: Inventario) => {
      const empresa = empresas.find(
        (empresa: Empresa) => empresa.id == inventario.id_empresa,
      );
      return {
        ...inventario,
        empresa,
      };
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Inventario> {
    return this.inventarioService.findById(id);
  }

  @Get(':id/produtos')
  async findProdutos(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProdutoInventario[]> {
    return this.inventarioService.findProdutos(id);
  }

  @Post()
  create(
    @Request() request,
    @Body() body: CreateInventarioDto,
  ): Promise<Inventario> {
    return this.inventarioService.create(request.user.id, body);
  }

  @Put(':id/finalizar')
  finalizar(@Param('id', ParseIntPipe) id: number): Promise<Inventario> {
    return this.inventarioService.finalizar(id);
  }

  @Delete(':id')
  async remover(@Param('id', ParseIntPipe) id: number): Promise<Inventario> {
    const inventario = await this.inventarioService.findById(id);

    if (!inventario) {
      throw new NotFoundException('Inventário não encontrado!');
    }

    return await this.inventarioService.delete(id);
  }

  @Delete('produto/:id')
  async deleteProduto(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProdutoInventario> {
    const produtoInventario = await this.inventarioService.findProdutoById(id);

    if (!produtoInventario) {
      throw new NotFoundException(
        null,
        'Produto não encontrado no inventário!',
      );
    }

    const inventario = await this.inventarioService.findById(
      produtoInventario.id_inventario,
    );

    if (inventario.status == StatusInventario.FINALIZADO) {
      throw new InternalServerErrorException(null, 'Inventário finalizado!');
    }

    return this.inventarioService.deleteProduto(id);
  }

  @Post(':id/produto')
  async saveProduto(
    @Param('id', ParseIntPipe) id: number,
    @Request() request,
    @Body() body: AddProdutoInventarioDto,
  ): Promise<ProdutoInventario> {
    const inventario = await this.inventarioService.findById(id);

    if (!inventario) {
      throw new NotFoundException(null, 'Inventário não encontrado!');
    }

    if (inventario.status == StatusInventario.FINALIZADO) {
      throw new InternalServerErrorException(null, 'Inventário finalizado!');
    }

    if (body.id) {
      this.logger.debug(body);
      return this.inventarioService.updateProduto(body.id, body);
    }

    const produtoInventario =
      await this.inventarioService.findProdutoInventario(id, body.id_produto);

    if (produtoInventario) {
      return this.inventarioService.updateProduto(produtoInventario.id, body);
    }

    return this.inventarioService.addProduto(id, request.user.id, body);
  }
}
