import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FindPagamentoDTO } from '../../../services/pagamento.service';

@Injectable()
export class DashboardService {
  private searchSubject = new Subject<FindPagamentoDTO>();
  search$ = this.searchSubject.asObservable();

  search(params: FindPagamentoDTO): void {
    this.searchSubject.next(params);
  }
}
