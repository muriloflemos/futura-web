import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ProdutoEstoque } from '../dtos/produto-estoque.dto';
import { TipoEstoque } from '../enums/tipo-estoque.enum';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private produtosSubject = new BehaviorSubject<ProdutoEstoque[]>([]);
  produtos$ = this.produtosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  find(id_empresa: number, tipo_estoque: TipoEstoque, nome: string): void {
    if (nome.length < 3) {
      this.loadingSubject.next(false);
      this.clearProdutos();
      return;
    }

    this.clearProdutos();
    this.loadingSubject.next(true);
    nome = nome.toUpperCase();
    this.apiService
      .get<ProdutoEstoque[]>(`produto/${id_empresa}/${tipo_estoque}`, { nome })
      .subscribe((produtos: ProdutoEstoque[]) => {
        this.produtosSubject.next(produtos);
        this.loadingSubject.next(false);
      });
  }

  clearProdutos(): void {
    this.produtosSubject.next([]);
  }
}
