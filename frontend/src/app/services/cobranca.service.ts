import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../services/api.service';
import { CobrancaDTO } from '../interfaces/cobranca';
import { SaveCobrancaDTO } from '../dtos/save-cobranca.dto';
import { TotalizadorDTO } from '../dtos/totalizador.dto';

export interface FindCobrancaParamsDTO {
  id_empresa: number[];
  data_inicio?: string;
  data_fim?: string;
  data_emissao_inicio?: string;
  data_emissao_fim?: string;
  situacao?: number;
  parceiro?: string;
  vendedor?: string;
  numero?: number;
  modalidade?: number[];
  carteira?: number[];
  sort?: string;
  sortDirection?: string;
  programacao_inicio?: string;
  programacao_fim?: string;
  status_programacao?: number;
  forma?: number[];
  pontualidade?: string | string[];
  cobranca?: number | number[];
  status_cobranca?: number | number[];
  status_vencimento?: number;
  tipo_cobranca?: number;
  status_observacao?: number;
  status_observacao2?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CobrancaService {
  constructor(private apiService: ApiService) {}

  private prepareParams(paramsDTO: FindCobrancaParamsDTO): FindCobrancaParamsDTO {
    const params: FindCobrancaParamsDTO = {
      id_empresa: paramsDTO.id_empresa,
    };
    const {
      data_inicio,
      data_fim,
      data_emissao_inicio,
      data_emissao_fim,
      situacao,
      parceiro,
      vendedor,
      numero,
      modalidade,
      carteira,
      programacao_inicio,
      programacao_fim,
      status_programacao,
      forma,
      pontualidade,
      cobranca,
      status_cobranca,
      status_vencimento,
      tipo_cobranca,
      sort,
      sortDirection,
      status_observacao,
      status_observacao2,
    } = paramsDTO;
    if (data_inicio && data_fim) {
      params.data_inicio = data_inicio;
      params.data_fim = data_fim;
    }
    if (data_emissao_inicio && data_emissao_fim) {
      params.data_emissao_inicio = data_emissao_inicio;
      params.data_emissao_fim = data_emissao_fim;
    }
    if (situacao) params.situacao = situacao;
    if (parceiro) params.parceiro = parceiro;
    if (vendedor) params.vendedor = vendedor;
    if (numero) params.numero = numero;
    if (modalidade) params.modalidade = modalidade;
    if (carteira) params.carteira = carteira;
    if (programacao_inicio && programacao_fim) {
      params.programacao_inicio = programacao_inicio;
      params.programacao_fim = programacao_fim;
    }
    if (status_programacao) params.status_programacao = status_programacao;
    if (forma) params.forma = forma;
    if (pontualidade) params.pontualidade = pontualidade;
    if (cobranca) params.cobranca = cobranca;
    if (status_cobranca) params.status_cobranca = status_cobranca;
    if (status_vencimento) params.status_vencimento = status_vencimento;
    if (tipo_cobranca) params.tipo_cobranca = tipo_cobranca;
    if (sort) params.sort = sort;
    if (sortDirection) params.sortDirection = sortDirection;
    if (status_observacao) params.status_observacao = status_observacao;
    if (status_observacao2) params.status_observacao2 = status_observacao2;
    return params;
  }

  findAll(paramsDTO: FindCobrancaParamsDTO): Observable<CobrancaDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<CobrancaDTO[]>('cobranca', params);
  }

  findTotais(paramsDTO: FindCobrancaParamsDTO): Observable<TotalizadorDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<TotalizadorDTO[]>('cobranca/totais', params);
  }

  findDevedores(paramsDTO: FindCobrancaParamsDTO): Observable<TotalizadorDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<TotalizadorDTO[]>('cobranca/devedores', params);
  }

  getResumoVencimentos(paramsDTO: FindCobrancaParamsDTO): Observable<TotalizadorDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<TotalizadorDTO[]>('cobranca/resumo/vencimentos', params);
  }

  getResumoMensal(paramsDTO: FindCobrancaParamsDTO): Observable<TotalizadorDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<TotalizadorDTO[]>('cobranca/resumo/mensal', params);
  }

  save(params: SaveCobrancaDTO, lote = false): Observable<CobrancaDTO[]> {
    if (lote) {
      if (!params.programacao) delete params.programacao;
      if (!params.id_forma_pagamento) delete params.id_forma_pagamento;
      if (!params.pontualidade) delete params.pontualidade;
      if (!params.cobranca_preventiva) delete params.cobranca_preventiva;
      if (!params.status_cobranca) delete params.status_cobranca;
      if (!params.observacao) delete params.observacao;
    }
    return this.apiService.put<CobrancaDTO[]>('cobranca', params);
  }
}
