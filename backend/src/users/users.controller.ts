import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpException,
  Request,
  Logger,
} from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { DbService } from 'src/db.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ResetSenhaDto } from './dto/reset-senha.dto';
import { TipoUsuario } from './user';
import { UsersService } from './users.service';
import { Roles } from '../decorators/roles';
import { HttpStatus } from '@nestjs/common';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly db: DbService,
    private readonly userService: UsersService,
  ) {}

  @Roles(TipoUsuario.ADMINISTRADOR)
  @Get()
  async getUsers(@Query() query: any): Promise<Usuario[]> {
    const nome = query?.nome || '';
    const tipo = query?.tipo || [
      TipoUsuario.ADMINISTRADOR,
      TipoUsuario.ESTOQUISTA,
      TipoUsuario.FATURISTA,
      TipoUsuario.ANALISTA_CREDITO,
      TipoUsuario.CONTAS_RECEBER,
      TipoUsuario.CONTAS_PAGAR,
    ];
    return this.userService.findAll(nome, tipo);
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<Usuario | null> {
    return this.userService.findUnique(+id);
  }

  @Roles(TipoUsuario.ADMINISTRADOR)
  @Post()
  create(@Body() body: CreateUsuarioDto): Promise<Usuario> {
    return this.userService.create(body);
  }

  @Roles(TipoUsuario.ADMINISTRADOR)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateUsuarioDto,
  ): Promise<Usuario> {
    return this.userService.update(+id, body);
  }

  @Roles(TipoUsuario.ADMINISTRADOR)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() request): Promise<Usuario> {
    if (request.user.id == id) {
      throw new HttpException(
        'Não é possível excluir a si próprio!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return this.userService.delete(+id);
  }

  @Put(':id/reset/password')
  resetSenha(
    @Param('id') id: string,
    @Body() body: ResetSenhaDto,
    @Request() request,
  ): Promise<Usuario> {
    if (
      request.user.tipo !== TipoUsuario.ADMINISTRADOR &&
      request.user.id !== +id
    ) {
      throw new HttpException(
        'Você não tem permissão para alterar esta senha!',
        HttpStatus.FORBIDDEN,
      );
    }
    return this.userService.resetSenha(+id, body);
  }
}
