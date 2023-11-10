export interface CobrancaDTO {
  id: string;
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
