import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../services/api.service';
import { Modalidade } from '../interfaces/modalidade';

@Injectable({
  providedIn: 'root'
})
export class ModalidadeService {
  constructor(private apiService: ApiService) {}

  findAll(): Observable<Modalidade[]> {
    return this.apiService.get<Modalidade[]>('modalidade');
  }

  findAllFutura(): Observable<Modalidade[]> {
    return this.apiService.get<Modalidade[]>('modalidade/futura');
  }
}
