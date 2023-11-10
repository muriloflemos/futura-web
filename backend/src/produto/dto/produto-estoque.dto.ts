import { Produto } from '../produto';

export type ProdutoEstoqueDTO = Produto & { quantidade: number };
