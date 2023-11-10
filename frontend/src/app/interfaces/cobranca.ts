export interface Cobranca {
  controle: number;
  programacao?: Date;
  id_forma_pagamento?: string;
  pontualidade?: string;
  cobranca_preventiva?: string;
  status_cobranca?: string;
  observacao?: string;
  observacao2?: string;
}

export interface CobrancaDTO {
  id: number;
  id_unidade: number;
  unidade: string;
  id_parceiro: number;
  parceiro: string;
  id_vendedor: number;
  vendedor: string;
  vencimento: Date;
  valor: number;
  numero: number;
  modalidade: string;
  carteira: string;
  programacao?: Date;
  forma?: number;
  pontualidade?: string;
  cobranca?: number;
  status_cobranca?: number;
  observacao?: string;
  observacao2?: string;
}
