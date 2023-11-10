import { IsNotEmpty } from 'class-validator';
import { TipoEstoque } from 'src/users/user';

export class CreateInventarioDto {
  @IsNotEmpty({ message: 'A data do inventário é obrigatória!' })
  data: Date;

  @IsNotEmpty({ message: 'O id da empresa é obrigatório!' })
  id_empresa: number;

  @IsNotEmpty({ message: 'O tipo do estoque é obrigatório!' })
  tipo_estoque: TipoEstoque;
}
