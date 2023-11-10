import { IsNotEmpty } from 'class-validator';

export class ResetSenhaDto {
  @IsNotEmpty({ message: 'O nova senha do usuário é obrigatória!' })
  senha: string;
}
