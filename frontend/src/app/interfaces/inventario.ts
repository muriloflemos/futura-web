import { InventarioStatus } from '../enums/inventario-status.enum';
import { TipoEstoque } from '../enums/tipo-estoque.enum';
import { Usuario } from './usuario'
import { Empresa } from './empresa'

export interface Inventario {
  id: number;
  data: Date;
  id_empresa: number;
  tipo_estoque: TipoEstoque,
  status: InventarioStatus;
  Usuario: Usuario;
  empresa?: Empresa;
}
