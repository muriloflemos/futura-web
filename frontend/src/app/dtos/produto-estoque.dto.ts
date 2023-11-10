import { Produto } from "../interfaces/produto";

export interface ProdutoEstoque extends Produto {
  quantidade: number;
  quantidadeContada?: number;
}
