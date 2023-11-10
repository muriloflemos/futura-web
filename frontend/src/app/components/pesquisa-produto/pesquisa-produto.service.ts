import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ProdutoEstoque } from '../../dtos/produto-estoque.dto';

export interface AddProdutoEstoque {
  produtoEstoque: ProdutoEstoque;
  quantidade: number;
}

@Injectable({
  providedIn: 'root',
})
export class PesquisaProdutoService {
  private addProdutoSubject = new Subject<AddProdutoEstoque | null>();
  addProduto$ = this.addProdutoSubject.asObservable();

  constructor() {}

  addProduto(produtoEstoque: ProdutoEstoque, quantidade: number): void {
    this.addProdutoSubject.next({
      produtoEstoque,
      quantidade,
    });
  }
}
