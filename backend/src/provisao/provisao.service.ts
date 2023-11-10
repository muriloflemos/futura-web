import { Injectable } from '@nestjs/common';
import { Provisao } from '@prisma/client';
import { DbService } from '../db.service';
import { SaveProvisaoDto } from './dto/save-provisao.dto';
import { FindProvisaoDTO } from './dto/find-provisao.dto';

@Injectable()
export class ProvisaoService {
  constructor(private readonly db: DbService) {}

  async find(data: FindProvisaoDTO): Promise<Provisao[]> {
    const conditions: any = {};

    if (data.id_empresa) {
      if (!Array.isArray(data.id_empresa)) {
        data.id_empresa = [data.id_empresa];
      }

      conditions['id_empresa'] = {
        in: data.id_empresa.map((value) => Number(value)),
      };
    }

    if (data.parceiro) {
      conditions['parceiro'] = { contains: data.parceiro };
    }

    if (data.modalidade) {
      if (!Array.isArray(data.modalidade)) {
        data.modalidade = [data.modalidade];
      }

      conditions['id_modalidade'] = {
        in: data.modalidade.map((value) => Number(value)),
      };
    }

    const orderBy: any = {};

    if (data.sort) {
      orderBy[data.sort] = data.sortDirection ?? 'asc';
    } else {
      orderBy['vencimento'] = 'asc';
    }

    return await this.db.provisao.findMany({
      where: {
        AND: [
          {
            vencimento: { gte: data.data_inicio },
          },
          {
            vencimento: { lte: data.data_fim },
          },
        ],
        ...conditions,
      },
      include: {
        Usuario: true,
      },
      orderBy,
    });
  }

  async create(data: SaveProvisaoDto, id_usuario: number): Promise<Provisao> {
    return await this.db.provisao.create({
      data: {
        ...data,
        id_usuario,
      },
      include: {
        Usuario: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: SaveProvisaoDto,
    id_usuario: number,
  ): Promise<Provisao> {
    return await this.db.provisao.update({
      where: { id },
      data: {
        ...data,
        id_usuario,
      },
      include: { Usuario: true },
    });
  }

  async delete(id: number): Promise<Provisao> {
    return await this.db.provisao.delete({
      where: { id },
    });
  }
}
