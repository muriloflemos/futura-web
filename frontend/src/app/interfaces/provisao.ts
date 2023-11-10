export interface ProvisaoDTO {
  id: number;
  id_empresa: number;
  unidade: string;
  parceiro?: string;
  vencimento: Date;
  valor: number;
  id_modalidade: number;
  modalidade: string;
}

export class FindProvisaoDTO {
  id_empresa: number[];
  data_inicio: string;
  data_fim: string;
  parceiro?: string;
  modalidade?: number[];
  sort?: string;
  sortDirection?: string;
}

export class SaveProvisaoDto {
  id?: number;
  id_empresa: number;
  id_modalidade: number;
  parceiro?: string;
  vencimento: Date;
  valor: number;
}
