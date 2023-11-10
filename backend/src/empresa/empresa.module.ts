import { Module } from '@nestjs/common';
import { DbService } from '../db.service';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';
import { OracleDbService } from '../oracle-db.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [EmpresaService, OracleDbService, DbService, UsersService],
  controllers: [EmpresaController],
})
export class EmpresaModule {}
