import { Controller, Get } from '@nestjs/common';
import { GetUser } from '../users/user.decorator';
import { Usuario } from '@prisma/client';
import { Empresa } from './empresa';
import { EmpresaService } from './empresa.service';
import { UsersService } from '../users/users.service';

@Controller('empresa')
export class EmpresaController {
  constructor(
    private readonly empresaService: EmpresaService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(@GetUser() usuario: Usuario): Promise<Empresa[]> {
    const empresas = await this.usersService.getEmpresas(usuario.id);
    return this.empresaService.findAll(empresas);
  }
}
