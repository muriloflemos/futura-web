import { Produto } from '../interfaces/produto';

export interface ProdutoInventarioDTO extends Produto {
  id_produto: number;
  id_inventario?: number;
  id_usuario?: number;
  quantidade_estoque: number;
  quantidade_contada: number;
  hidden?: boolean;
}
