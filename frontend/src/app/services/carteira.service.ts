import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../services/api.service';
import { Carteira } from '../interfaces/carteira';

@Injectable({
  providedIn: 'root'
})
export class CarteiraService {
  constructor(private apiService: ApiService) {}

  findAll(): Observable<Carteira[]> {
    return this.apiService.get<Carteira[]>('carteira');
  }

  findAllFutura(): Observable<Carteira[]> {
    return this.apiService.get<Carteira[]>('carteira/futura');
  }
}
