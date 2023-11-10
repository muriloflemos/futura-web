import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class AddProdutoInventarioDto {
  @IsOptional()
  @IsInt({ message: 'O id deve ser um inteiro' })
  id: number;

  @IsInt()
  @IsNotEmpty({ message: 'O id do produto é obrigatório' })
  id_produto: number;

  @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
  nome: string;

  @IsNotEmpty({ message: 'A unidade do produto é obrigatória' })
  unidade: string;

  @IsNotEmpty({ message: 'A quantidade em estoque é obrigatória' })
  quantidade_estoque: number;

  @IsNotEmpty({ message: 'A quantidade contada é obrigatória' })
  quantidade_contada: number;
}
