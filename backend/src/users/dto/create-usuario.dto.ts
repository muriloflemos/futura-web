import { IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateUsuarioDto {
  @IsNotEmpty({ message: 'O nome do usuário é obrigatório!' })
  nome: string;

  @IsNotEmpty({ message: 'O login do usuário é obrigatório!' })
  login: string;

  @IsNotEmpty({ message: 'A senha do usuário é obrigatório!' })
  senha: string;

  @IsNotEmpty({ message: 'O tipo do usuário é obrigatório!' })
  tipo: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  id_empresa: number[];

  @IsOptional()
  tipo_estoque: number;
}

export const usuarioCreateFromDTO = (data: CreateUsuarioDto) => {
  return {
    nome: data.nome,
    login: data.login,
    senha: data.senha,
    tipo: data.tipo,
    tipo_estoque: data.tipo_estoque || 0,
  };
};
