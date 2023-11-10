import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { ProdutoEstoqueDTO } from './dto/produto-estoque.dto';
import { TipoEstoque } from 'src/users/user';

@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get(':id_empresa/:tipo_estoque')
  async getProdutos(
    @Param('id_empresa', ParseIntPipe) id_empresa: number,
    @Param('tipo_estoque', ParseIntPipe) tipo_estoque: TipoEstoque,
    @Query() query: any,
  ): Promise<ProdutoEstoqueDTO[]> {
    const nome = query?.nome || '';
    const limit = query?.limit || 20;
    return this.produtoService.findAll(nome, id_empresa, tipo_estoque, limit);
  }
}
