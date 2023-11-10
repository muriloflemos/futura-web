import { Module } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { ProdutoController } from './produto.controller';
import { OracleDbService } from '../oracle-db.service';

@Module({
  providers: [ProdutoService, OracleDbService],
  controllers: [ProdutoController],
})
export class ProdutoModule {}
