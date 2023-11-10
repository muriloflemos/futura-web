import { Injectable } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ProvisaoDTO, SaveProvisaoDto, FindProvisaoDTO } from '../interfaces/provisao';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProvisaoService {
  constructor(private apiService: ApiService) {}

  private prepareParams(paramsDTO: FindProvisaoDTO): FindProvisaoDTO {
    const params: FindProvisaoDTO = {
      id_empresa: paramsDTO.id_empresa,
      data_inicio: paramsDTO.data_inicio,
      data_fim: paramsDTO.data_fim,
    };
    const {
      parceiro,
      modalidade,
      sort,
      sortDirection,
    } = paramsDTO;
    if (parceiro) params.parceiro = parceiro;
    if (modalidade) params.modalidade = modalidade;
    if (sort) params.sort = sort;
    if (sortDirection) params.sortDirection = sortDirection;
    return params;
  }

  findAll(paramsDTO: FindProvisaoDTO): Observable<ProvisaoDTO[]> {
    const params = this.prepareParams(paramsDTO);
    return this.apiService.get<ProvisaoDTO[]>('provisao', params);
  }

  create(paramsDTO: SaveProvisaoDto): Observable<ProvisaoDTO> {
    return this.apiService.post<ProvisaoDTO>('provisao', paramsDTO);
  }

  update(id: number, paramsDTO: SaveProvisaoDto): Observable<ProvisaoDTO> {
    return this.apiService.put<ProvisaoDTO>(`provisao/${id}`, paramsDTO);
  }

  delete(id: number): Observable<ProvisaoDTO> {
    return this.apiService.delete<ProvisaoDTO>(`provisao/${id}`);
  }
}
