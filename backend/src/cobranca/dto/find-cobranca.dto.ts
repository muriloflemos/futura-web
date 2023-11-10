import {
  IsNotEmpty,
  IsNumberString,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindCobrancaDTO {
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
  sort?: string;

  @IsOptional()
  @IsString()
  sortDirection?: string;

  @IsOptional()
  @IsNumberString({}, { each: true })
  situacao?: number;

  @IsOptional()
  @IsNumberString({}, { each: true })
  status_vencimento?: number;

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
  numero?: number;

  @IsOptional()
  @IsNumberString({}, { each: true })
  carteira?: number[];

  @IsOptional()
  @IsDateString()
  programacao_inicio?: string;

  @IsOptional()
  @IsDateString()
  programacao_fim?: string;

  @IsOptional()
  @IsNumberString({}, { each: true })
  status_programacao?: number;

  @IsOptional()
  @IsNumberString({}, { each: true })
  forma?: number[];

  @IsOptional()
  pontualidade?: string[];

  @IsOptional()
  @IsNumberString({}, { each: true })
  cobranca?: number[];

  @IsOptional()
  @IsNumberString({}, { each: true })
  status_cobranca?: number[];

  @IsOptional()
  @IsNumberString({}, { each: true })
  tipo_cobranca?: number;

  @IsOptional()
  @IsNumberString({}, { each: true })
  status_observacao?: number;

  @IsOptional()
  @IsNumberString({}, { each: true })
  status_observacao2?: number;
}
