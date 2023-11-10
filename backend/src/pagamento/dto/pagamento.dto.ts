export interface PagamentoDTO {
  id: string;
  id_unidade: number;
  unidade: string;
  id_parceiro: number;
  parceiro: string;
  vencimento: Date;
  valor: number;
  ajuste: number;
  valorTotal: number;
  numero: number;
  modalidade: string;
  carteira: string;
  observacao?: string;
}
