import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { DbService } from '../db.service';
import {
  CreateUsuarioDto,
  usuarioCreateFromDTO,
} from './dto/create-usuario.dto';
import { ResetSenhaDto } from './dto/reset-senha.dto';
import {
  UpdateUsuarioDto,
  usuarioUpdateFromDTO,
} from './dto/update-usuario.dto';
import { TipoUsuario } from './user';

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {}

  async findUnique(id: number): Promise<Usuario | undefined> {
    return await this.db.usuario.findUnique({
      where: { id },
      include: { Empresa: true },
    });
  }

  async findOne(login: string): Promise<Usuario | undefined> {
    const user = await this.db.usuario.findFirst({ where: { login: login } });
    return user;
  }

  async findAll(nome: string, tipo: TipoUsuario[]): Promise<Usuario[]> {
    const usuarios = await this.db.usuario.findMany({
      where: { nome: { contains: nome }, tipo: { in: tipo } },
    });
    return usuarios.map((usuario) => {
      delete usuario.senha;
      return usuario;
    });
  }

  async create(data: CreateUsuarioDto): Promise<Usuario> {
    const usuario = await this.db.usuario.findFirst({
      where: { login: { equals: data.login } },
    });

    if (usuario) {
      throw new HttpException(
        'O usuário já existe! Tente novamente com outro login.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return await this.db.usuario.create({
      data: {
        ...usuarioCreateFromDTO(data),
        Empresa: {
          createMany: {
            data: data.id_empresa.map((id) => ({ id_empresa: id })),
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.db.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new HttpException(
        'O usuário não existe!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (data.login != usuario.login) {
      const usuarioByLogin = await this.db.usuario.findFirst({
        where: { login: data.login },
      });

      if (usuarioByLogin) {
        throw new HttpException(
          'O login de usuário já existe! Tente novamente com outro login.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    await this.db.usuarioEmpresa.deleteMany({ where: { id_usuario: id } });

    return await this.db.usuario.update({
      where: { id },
      data: {
        ...usuarioUpdateFromDTO(data),
        Empresa: {
          createMany: {
            data: data.id_empresa.map((id) => ({ id_empresa: id })),
          },
        },
      },
    });
  }

  async delete(id: number): Promise<Usuario> {
    const usuario = await this.db.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new HttpException(
        'O usuário não existe!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.db.usuarioEmpresa.deleteMany({ where: { id_usuario: id } });
    return await this.db.usuario.delete({ where: { id } });
  }

  async resetSenha(id: number, data: ResetSenhaDto): Promise<Usuario> {
    const usuario = await this.db.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new HttpException(
        'O usuário não existe!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return await this.db.usuario.update({ data, where: { id } });
  }

  async getEmpresas(id: number): Promise<number[]> {
    const usuarioEmpresas = await this.db.usuarioEmpresa.findMany({
      where: { id_usuario: id },
    });
    return usuarioEmpresas.map((usuarioEmpresa) => usuarioEmpresa.id_empresa);
  }
}
