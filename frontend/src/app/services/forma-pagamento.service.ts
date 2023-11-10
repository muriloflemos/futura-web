import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../services/api.service';
import { FormaPagamento } from '../interfaces/forma-pagamento';

@Injectable({
  providedIn: 'root'
})
export class FormaPagamentoService {
  constructor(private apiService: ApiService) {}

  findAll(): Observable<FormaPagamento[]> {
    return this.apiService.get<FormaPagamento[]>('forma-pagamento');
  }
}
