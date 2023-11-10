import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { TipoEstoque } from '../enums/tipo-estoque.enum';

export interface UsuarioEmpresa {
  id: number;
  id_empresa: number;
  id_usuario: number;
}

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  tipo: TipoUsuario;
  senha?: string;
  id_empresa?: number;
  tipo_estoque?: TipoEstoque;
  Empresa?: UsuarioEmpresa[];
}
