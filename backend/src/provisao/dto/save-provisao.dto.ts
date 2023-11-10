import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
} from 'class-validator';

export class SaveProvisaoDto {
  @IsNotEmpty({ message: 'O campo id_empresa é obrigatório!' })
  @IsNumber()
  id_empresa: number;

  @IsNotEmpty({ message: 'O campo id_modalidade é obrigatório!' })
  @IsNumber()
  id_modalidade: number;

  @IsOptional()
  @IsString()
  parceiro?: string;

  @IsNotEmpty({ message: 'O campo vencimento é obrigatório!' })
  @IsDateString()
  vencimento: Date;

  @IsNotEmpty({ message: 'O campo valor é obrigatório!' })
  @IsNumber()
  valor: number;
}
