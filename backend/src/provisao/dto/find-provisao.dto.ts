import {
  IsNotEmpty,
  IsNumberString,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindProvisaoDTO {
  @IsNotEmpty()
  @IsNumberString({}, { each: true })
  id_empresa: number[];

  @IsNotEmpty()
  @IsDateString()
  data_inicio: string;

  @IsNotEmpty()
  @IsDateString()
  data_fim: string;

  @IsOptional()
  @IsString()
  parceiro?: string;

  @IsOptional()
  @IsNumberString({}, { each: true })
  modalidade?: number[];

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  sortDirection?: string;
}
