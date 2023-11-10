import {
  IsNotEmpty,
  IsNumberString,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindPagamentoDTO {
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
  @IsDateString()
  data_emissao_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_emissao_fim?: string;

  @IsOptional()
  @IsString()
  parceiro?: string;

  @IsOptional()
  @IsNumberString({}, { each: true })
  numero?: number;

  @IsOptional()
  @IsNumberString({}, { each: true })
  modalidade?: number[];

  @IsOptional()
  @IsNumberString({}, { each: true })
  carteira?: number[];

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  sortDirection?: string;
}
