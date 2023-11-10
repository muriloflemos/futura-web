import { OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends OmitType(CreateUsuarioDto, [
  'senha',
] as const) {}

export const usuarioUpdateFromDTO = (data: UpdateUsuarioDto) => {
  return {
    nome: data.nome,
    login: data.login,
    tipo: data.tipo,
    tipo_estoque: data.tipo_estoque || 0,
  };
};
