import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { PagamentoDTO } from '../interfaces/pagamento';
import { Observable, of } from 'rxjs';
import { TotalizadorDTO } from '../dtos/totalizador.dto';

export class FindPagamentoDTO {
  id_empresa: number[];
  data_inicio?: string;
  data_fim?: string;
  data_emissao_inicio?: string;
  data_emissao_fim?: string;
  parceiro?: string;
  numero?: number;
  modalidade?: number[];
  carteira?: number[];
  sort?: string;
  sortDirection?: string;
}

export class SavePagamentoDTO {
  controle: string[];
  ajuste?: number | null;
  observacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagamentoService {
  constructor(private apiService: ApiService) {}

  private prepareParams(paramsDTO: FindPagamentoDTO): FindPagamentoDTO {
    const params: FindPagamentoDTO = {
      id_empresa: paramsDTO.id_empresa,
    };
    const {
      data_inicio,
      data_fim,
      data_emissao_inicio,
      data_emissao_fim,
      parceiro,
      numero,
      modalidade,
      carteira,
      sort,
      sortDirection,
    } = paramsDTO;
    if (data_inicio && data_fim) {
      params.data_inicio = data_inicio;
      params.data_fim = data_fim;
    }
    if (data_emissao_inicio && data_emissao_fim) {
      params.data_emissao_inicio = data_emissao_inicio;
      params.data_emissao_fim = data_emissao_fim;
    }
    if (parceiro) params.parceiro = parceiro;
    if (numero) params.numero = numero;
    if (modalidade) params.modalidade = modalidade;
    if (carteira) params.carteira = carteira;
    if (sort) params.sort = sort;
    if (sortDirection) params.sortDirection = sortDirection;
    return params;
  }

  findAll(paramsDTO: FindPagamentoDTO): Observable<PagamentoDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<PagamentoDTO[]>('pagamento', params);
  }

  save(params: SavePagamentoDTO): Observable<PagamentoDTO[]> {
    params.controle = params.controle.map((value) => `${value}`);
    return this.apiService.put<PagamentoDTO[]>('pagamento', params);
  }

  getResumoPagamentos(paramsDTO: FindPagamentoDTO): Observable<TotalizadorDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<TotalizadorDTO[]>('pagamento/resumo/pagamentos', params);
  }

  getResumoMensal(paramsDTO: FindPagamentoDTO): Observable<TotalizadorDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<TotalizadorDTO[]>('pagamento/resumo/mensal', params);
  }
}
