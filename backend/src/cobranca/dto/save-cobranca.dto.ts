import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsInt,
} from 'class-validator';

export class SaveCobrancaDTO {
  @IsNotEmpty()
  controle: string[];

  @IsOptional()
  @IsDateString()
  programacao?: Date;

  @IsOptional()
  @IsNumber()
  id_forma_pagamento?: number;

  @IsOptional()
  pontualidade?: string;

  @IsOptional()
  @IsInt()
  cobranca_preventiva?: number;

  @IsOptional()
  @IsInt()
  status_cobranca?: number;

  @IsOptional()
  observacao?: string;

  @IsOptional()
  observacao2?: string;
}

export const saveCobrancaDtoToData = (dto: SaveCobrancaDTO): any => {
  const data = {};
  if ('programacao' in dto) {
    data['programacao'] = dto.programacao || null;
  }
  if ('id_forma_pagamento' in dto) {
    data['id_forma_pagamento'] = dto.id_forma_pagamento || null;
  }
  if ('pontualidade' in dto) {
    data['pontualidade'] = dto.pontualidade || null;
  }
  if ('cobranca_preventiva' in dto) {
    data['cobranca_preventiva'] = dto.cobranca_preventiva || null;
  }
  if ('status_cobranca' in dto) {
    data['status_cobranca'] = dto.status_cobranca;
  }
  if ('observacao' in dto) {
    data['observacao'] = dto.observacao;
  }
  if ('observacao2' in dto) {
    data['observacao2'] = dto.observacao2;
  }
  return data;
};
