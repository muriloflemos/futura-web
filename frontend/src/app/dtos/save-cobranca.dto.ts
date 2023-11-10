export class SaveCobrancaDTO {
  controle: number[];
  programacao?: Date | null;
  id_forma_pagamento?: number;
  pontualidade?: string;
  cobranca_preventiva?: number | null;
  status_cobranca?: number | null;
  observacao?: string | null;
  observacao2?: string | null;
}
