import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from '../services/api.service';
import { Inventario } from '../interfaces/inventario';
import { InventarioStatus } from '../enums/inventario-status.enum';
import { ProdutoInventarioDTO } from '../dtos/produto-inventario.dto';
import { TipoEstoque } from '../enums/tipo-estoque.enum';

@Injectable({
  providedIn: 'root',
})
export class InventarioService {
  private inventariosSubject = new BehaviorSubject<Inventario[]>([]);
  inventarios$ = this.inventariosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  find(status: InventarioStatus[], dataInicio?: Date, dataFim?: Date): void {
    this.inventariosSubject.next([]);
    this.loadingSubject.next(true);
    this.apiService
      .get<Inventario[]>('inventario', { status, dataInicio, dataFim })
      .subscribe((inventarios: Inventario[]) => {
        this.inventariosSubject.next(inventarios);
        this.loadingSubject.next(false);
      });
  }

  findById(id: number): Observable<Inventario> {
    return this.apiService.get<Inventario>(`inventario/${id}`);
  }

  findProdutos(inventarioId: number): Observable<ProdutoInventarioDTO[]> {
    return this.apiService.get<ProdutoInventarioDTO[]>(
      `inventario/${inventarioId}/produtos`
    );
  }

  reset(): void {
    this.inventariosSubject.next([]);
  }

  create(
    data: Date,
    id_empresa: number,
    tipo_estoque: TipoEstoque
  ): Observable<Inventario> {
    const body = { data, id_empresa, tipo_estoque };
    return this.apiService.post<Inventario>('inventario', body);
  }

  delete(id: number): Observable<Inventario> {
    return this.apiService.delete<Inventario>(`inventario/${id}`);
  }

  addProduto(
    id: number,
    produtoInventario: ProdutoInventarioDTO
  ): Observable<ProdutoInventarioDTO> {
    return this.apiService.post<ProdutoInventarioDTO>(
      `inventario/${id}/produto`,
      produtoInventario
    );
  }

  deleteProduto(id: number): Observable<ProdutoInventarioDTO> {
    return this.apiService.delete<ProdutoInventarioDTO>(
      `inventario/produto/${id}`
    );
  }

  finalizar(id: number): Observable<Inventario> {
    return this.apiService.put<Inventario>(`inventario/${id}/finalizar`);
  }
}
