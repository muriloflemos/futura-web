import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { ProdutoEstoque } from '../../dtos/produto-estoque.dto';
import { TipoEstoque } from '../../enums/tipo-estoque.enum';
import { ProdutoService } from '../../services/produto.service';
import { PesquisaProdutoService } from './pesquisa-produto.service';
import { ProdutoInventarioDTO } from '../../dtos/produto-inventario.dto';

export interface PesquisaProdutoInfo {
  id_empresa: number;
  tipo_estoque: TipoEstoque;
  produtos?: ProdutoInventarioDTO[];
}

@Component({
  selector: 'app-pesquisa-produto',
  templateUrl: './pesquisa-produto.component.html',
  styleUrls: ['./pesquisa-produto.component.css'],
})
export class PesquisaProdutoComponent implements OnInit {
  displayedColumns: string[] = ['codigo', 'produto', 'quantidade', 'acoes'];
  produtos$: Observable<ProdutoEstoque[]>;
  loading$: Observable<boolean>;

  searchString = '';
  searchFieldChange = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<PesquisaProdutoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PesquisaProdutoInfo,
    private produtoService: ProdutoService,
    private pesquisaProdutoService: PesquisaProdutoService
  ) {
    this.produtos$ = this.produtoService.produtos$.pipe(
      map((items: ProdutoEstoque[]) => {
        const produtos: ProdutoEstoque[] = [];
        for (const item of items) {
          const produtoExistente = this.data.produtos?.find(
            (value: ProdutoInventarioDTO) => {
              const id = item?.id ? item.id : 0;
              return value.id_produto == id;
            }
          );
          produtos.push({
            ...item,
            quantidadeContada: produtoExistente ? produtoExistente.quantidade_contada : 0,
          });
        }
        console.log(produtos);
        return produtos;
      })
    );
    this.loading$ = this.produtoService.loading$;
    this.searchFieldChange
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value: string) => {
        this.produtoService.find(data.id_empresa, data.tipo_estoque, value);
      });
  }

  ngOnInit(): void {}

  cancelar(): void {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  onSearchChange(event: string): void {
    this.searchFieldChange.next(event);
  }

  onAddProduto(produto: ProdutoEstoque, quantidade: number): void {
    this.pesquisaProdutoService.addProduto(produto, quantidade);
  }
}
