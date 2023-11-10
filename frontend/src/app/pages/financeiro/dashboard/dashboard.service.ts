import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { FindCobrancaParamsDTO } from '../../../services/cobranca.service';

@Injectable()
export class DashboardService {
  private searchSubject = new BehaviorSubject<FindCobrancaParamsDTO | null>(null);
  search$ = this.searchSubject.asObservable();

  constructor(private apiService: ApiService) {}

  search(params: FindCobrancaParamsDTO): void {
    this.searchSubject.next(params);
  }
}
