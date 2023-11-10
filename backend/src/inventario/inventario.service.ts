import { Injectable } from '@nestjs/common';
import { Inventario, ProdutoInventario, Usuario } from '@prisma/client';
import { DbService } from 'src/db.service';
import { TipoUsuario } from 'src/users/user';
import { AddProdutoInventarioDto } from './dto/add-produto-inventario.dto';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { StatusInventario } from './status-inventario.enum';

@Injectable()
export class InventarioService {
  constructor(private readonly db: DbService) {}

  async findAll(
    status: StatusInventario[],
    dataInicio: Date,
    dataFim: Date,
    usuario: Usuario,
    idEmpresa?: number[],
  ): Promise<Inventario[]> {
    const conditions: any = {};

    if (usuario.tipo !== TipoUsuario.ADMINISTRADOR) {
      conditions['tipo_estoque'] = usuario.tipo_estoque;

      if (idEmpresa.length > 0) {
        conditions['id_empresa'] = { in: idEmpresa };
      }
    }

    return this.db.inventario.findMany({
      where: {
        status: { in: status },
        deleted: false,
        AND: [
          {
            data: { gte: dataInicio },
          },
          {
            data: { lte: dataFim },
          },
        ],
        ...conditions,
      },
      include: { Usuario: true },
    });
  }

  async findById(id: number): Promise<Inventario> {
    return this.db.inventario.findUnique({
      where: { id },
      include: { Usuario: true },
    });
  }

  async findProdutoById(id: number): Promise<ProdutoInventario> {
    return this.db.produtoInventario.findUnique({
      where: { id },
    });
  }

  async findProdutoInventario(
    id_inventario: number,
    id_produto: number,
  ): Promise<ProdutoInventario> {
    return this.db.produtoInventario.findFirst({
      where: { id_inventario, id_produto },
    });
  }

  async findProdutos(id_inventario: number): Promise<ProdutoInventario[]> {
    return this.db.produtoInventario.findMany({
      where: { id_inventario },
    });
  }

  async create(
    id_usuario: number,
    data: CreateInventarioDto,
  ): Promise<Inventario> {
    return this.db.inventario.create({
      data: {
        status: StatusInventario.ABERTO,
        id_usuario: id_usuario,
        ...data,
      },
      include: { Usuario: true },
    });
  }

  async finalizar(id: number): Promise<Inventario> {
    return this.db.inventario.update({
      where: { id },
      data: {
        status: StatusInventario.FINALIZADO,
      },
      include: { Usuario: true },
    });
  }

  async delete(id: number): Promise<Inventario> {
    return this.db.inventario.update({
      where: { id },
      data: { deleted: true },
      include: { Usuario: true },
    });
  }

  async addProduto(
    id_inventario: number,
    id_usuario: number,
    data: AddProdutoInventarioDto,
  ): Promise<ProdutoInventario> {
    return this.db.produtoInventario.create({
      data: {
        id_inventario,
        id_usuario,
        ...data,
      },
      include: { Usuario: true },
    });
  }

  async updateProduto(
    id: number,
    data: AddProdutoInventarioDto,
  ): Promise<ProdutoInventario> {
    return this.db.produtoInventario.update({
      where: { id },
      data: {
        ...data,
      },
      include: { Usuario: true },
    });
  }

  async deleteProduto(id: number): Promise<ProdutoInventario> {
    return this.db.produtoInventario.delete({
      where: { id },
    });
  }

  async deleteProdutos(id_inventario: number): Promise<any> {
    return this.db.produtoInventario.deleteMany({
      where: { id_inventario },
    });
  }
}
