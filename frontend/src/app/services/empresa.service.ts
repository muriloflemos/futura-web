import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../services/api.service';
import { Empresa } from '../interfaces/empresa';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private empresasSubject = new BehaviorSubject<Empresa[]>([]);
  empresas$ = this.empresasSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  find(): void {
    this.loadingSubject.next(true);
    this.getAll().subscribe((empresas: Empresa[]) => {
      this.empresasSubject.next(empresas);
      this.loadingSubject.next(false);
    });
  }

  getAll(): Observable<Empresa[]> {
    return this.apiService.get<Empresa[]>('empresa');
  }
}
