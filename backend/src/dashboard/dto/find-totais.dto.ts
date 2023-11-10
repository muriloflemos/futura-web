import {
  IsNotEmpty,
  IsNumberString,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindTotaisDTO {
  @IsNotEmpty()
  @IsNumberString({}, { each: true })
  id_empresa: number[];

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @IsOptional()
  @IsNumberString({}, { each: true })
  modalidade?: number[];

  @IsOptional()
  @IsString()
  parceiro?: string;

  @IsOptional()
  @IsString()
  vendedor?: string;

  @IsOptional()
  @IsNumberString({}, { each: true })
  carteira?: number[];
}
