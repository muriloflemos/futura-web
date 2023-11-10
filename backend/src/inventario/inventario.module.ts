import { Module } from '@nestjs/common';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { EmpresaService } from '../empresa/empresa.service';
import { DbService } from '../db.service';
import { OracleDbService } from '../oracle-db.service';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [InventarioController],
  providers: [
    DbService,
    OracleDbService,
    InventarioService,
    EmpresaService,
    UsersService,
  ],
})
export class InventarioModule {}
