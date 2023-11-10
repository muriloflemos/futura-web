import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class SavePagamentoDTO {
  @IsNotEmpty()
  @IsString({ each: true })
  controle: string[];

  @IsOptional()
  @IsNumber()
  ajuste?: number;

  @IsOptional()
  observacao?: string;
}

export const savePagamentoDtoToData = (dto: SavePagamentoDTO): any => {
  const data = {};
  if ('ajuste' in dto) data['ajuste'] = dto.ajuste !== 0 ? dto.ajuste : null;
  if ('observacao' in dto) data['observacao'] = dto.observacao;
  return data;
};
