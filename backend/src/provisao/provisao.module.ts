import { Module } from '@nestjs/common';
import { DbService } from '../db.service';
import { ProvisaoController } from './provisao.controller';
import { ProvisaoService } from './provisao.service';

@Module({
  controllers: [ProvisaoController],
  providers: [ProvisaoService, DbService],
})
export class ProvisaoModule {}
