import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Workbook, Style } from 'exceljs';
import * as fs from 'file-saver';

import { ProdutoInventarioDTO } from '../../dtos/produto-inventario.dto';
import { InventarioService } from '../../services/inventario.service';
import { ProdutoService } from '../../services/produto.service';
import {
  PesquisaProdutoComponent,
  PesquisaProdutoInfo,
} from '../../components/pesquisa-produto/pesquisa-produto.component';
import {
  PesquisaProdutoService,
  AddProdutoEstoque,
} from '../../components/pesquisa-produto/pesquisa-produto.service';
import { ProdutoEstoque } from '../../dtos/produto-estoque.dto';
import { AlertService } from '../../services/alert/alert.service';
import { EmpresaService } from '../../services/empresa.service';
import { AuthService } from '../../services/auth.service';
import { Inventario } from '../../interfaces/inventario';
import { Empresa } from '../../interfaces/empresa';
import { TipoEstoque } from '../../enums/tipo-estoque.enum';
import { Usuario } from '../../interfaces/usuario';
import { TipoUsuario } from '../../enums/tipo-usuario.enum';
import { InventarioStatus } from '../../enums/inventario-status.enum';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'produto',
    'unidade',
    'quantidade_estoque',
    'quantidade_contada',
    'acoes',
  ];

  tiposEstoque: { id: number; label: string }[] = [
    {
      id: TipoEstoque.TODOS,
      label: 'Todos/Geral',
    },
    {
      id: TipoEstoque.MATRIZ,
      label: 'Matriz',
    },
    {
      id: TipoEstoque.HF,
      label: 'HF',
    },
  ];

  form = this.formBuilder.group({
    data: [new Date()],
    id_empresa: ['', [Validators.required]],
    tipo_estoque: ['', [Validators.required]],
  });

  isSaving = false;
  finalizado = false;
  inventario?: Inventario;
  private produtosSubject: BehaviorSubject<ProdutoInventarioDTO[]>;
  produtos$: Observable<ProdutoInventarioDTO[]>;
  produtosSalvos: ProdutoInventarioDTO[] = [];
  empresas: Observable<Empresa[]>;

  private usuarioSubject = new BehaviorSubject<Usuario | undefined>(undefined);
  usuario$ = this.usuarioSubject.asObservable();

  private destroyNotifier = new Subject();

  somenteDiferencas = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private inventarioService: InventarioService,
    private produtoService: ProdutoService,
    private dialog: MatDialog,
    private empresaService: EmpresaService,
    private authService: AuthService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private pesquisaProdutoService: PesquisaProdutoService
  ) {
    this.produtosSubject = new BehaviorSubject<ProdutoInventarioDTO[]>([]);
    this.produtos$ = this.produtosSubject.asObservable();

    this.empresas = this.empresaService.empresas$;
    this.pesquisaProdutoService.addProduto$
      .pipe(takeUntil(this.destroyNotifier))
      .subscribe((addProdutoEstoque: AddProdutoEstoque | null) => {
        if (addProdutoEstoque) {
          this.addProdutoToInventario(
            addProdutoEstoque.produtoEstoque,
            addProdutoEstoque.quantidade
          );
        }
      });
  }

  ngOnInit(): void {
    this.authService.getUser().then((usuario) => {
      if (usuario) {
        this.usuarioSubject.next(usuario);

        if (usuario.tipo != TipoUsuario.Administrador) {
          this.form.patchValue({
            id_empresa: usuario.id_empresa,
            tipo_estoque: usuario.tipo_estoque,
          });
          this.form.controls['tipo_estoque'].disable();
        }
      }
    });
    this.empresaService.find();
    this.route.params.subscribe((params) => {
      const id = +params?.id;
      if (id) {
        this.inventarioService
          .findById(id)
          .subscribe((inventario: Inventario) => {
            this.inventario = inventario;
            this.finalizado = inventario.status == InventarioStatus.FINALIZADO;
            this.form.patchValue({
              data: inventario.data,
              id_empresa: inventario.id_empresa,
              tipo_estoque: inventario.tipo_estoque,
            });
            this.form.controls['id_empresa'].disable();
            this.form.controls['tipo_estoque'].disable();
          });
        this.inventarioService.findProdutos(id).subscribe((produtos) => {
          this.updateProdutos(produtos);
          this.produtosSalvos.push(...produtos);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.produtoService.clearProdutos();
    this.destroyNotifier.next();
    this.destroyNotifier.complete();
  }

  voltar(): void {
    this.router.navigate(['inventarios']);
  }

  fecharInventario(): void {
    this.alertService
      .showYesNo('Deseja finalizar o inventário?')
      .then((value) => {
        if (value) {
          this.isSaving = true;
          this.salvarProdutos().then(() => {
            const id = this.inventario?.id || 0;
            this.inventarioService.finalizar(id).subscribe((inventario) => {
              this.inventario = inventario;
              this.finalizado =
                inventario.status == InventarioStatus.FINALIZADO;
              setTimeout(() => {
                this.isSaving = false;
              }, 1000);
            });
          });
        }
      });
  }

  salvar(): void {
    if (!this.form.valid) {
      return;
    }

    this.isSaving = true;

    if (this.inventario) {
      this.salvarProdutos().then(() => {
        setTimeout(() => {
          this.isSaving = false;
        }, 1000);
      });
    } else {
      this.authService.getUser().then((usuario: Usuario | null) => {
        if (usuario) {
          let { data, id_empresa, tipo_estoque } = this.form.value;

          if (usuario.tipo !== TipoUsuario.Administrador) {
            tipo_estoque = usuario.tipo_estoque;
          }

          this.inventarioService
            .create(new Date(data), id_empresa, tipo_estoque)
            .subscribe((inventario: Inventario) => {
              this.inventario = inventario;
              this.form.controls['id_empresa'].disable();
              this.form.controls['tipo_estoque'].disable();
              this.salvarProdutos().then(() => {
                setTimeout(() => {
                  this.isSaving = false;
                }, 1000);
              });
            });
        }
      });
    }
  }

  salvarProdutos(): Promise<void> {
    return new Promise((resolve) => {
      const inventarioId = this.inventario?.id || null;
      const produtos = this.produtosSubject.value;

      if (inventarioId) {
        const requests: Observable<unknown>[] = [];
        produtos.forEach((produto: ProdutoInventarioDTO) => {
          requests.push(
            this.inventarioService.addProduto(inventarioId, produto)
          );
        });
        this.produtosSalvos.filter((produto) => {
          const id = produto?.id || 0;
          const index = produtos.findIndex((p) => produto.id == p.id);
          if (id > 0 && index < 0) {
            requests.push(this.inventarioService.deleteProduto(id));
          }
        });

        if (requests.length > 0) {
          forkJoin(requests).subscribe(
            () => {
              resolve();
            },
            () => {
              this.alertService.showError(
                'Ocorreu um erro ao salvar, entre em contato com suporte se o problema persistir!'
              );
              resolve();
            }
          );
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  }

  delete(item: ProdutoInventarioDTO): void {
    this.alertService
      .showYesNo('Deseja remover o produto do inventário?', '')
      .then((result) => {
        if (result) {
          const produtos = this.produtosSubject.value;
          const index = produtos.findIndex((value) => value.id_produto == item.id_produto);
          if (index >= 0) {
            produtos.splice(index, 1);
            this.updateProdutos(produtos);
          }
        }
      });
  }

  updateProdutos(produtos: ProdutoInventarioDTO[]): void {
    this.produtosSubject.next(
      produtos.sort((a, b) =>
        a.nome.toLowerCase() > b.nome.toLowerCase() ? 1 : -1
      )
    );
  }

  onChangeDiferencas(event: MatSlideToggleChange): void {
    const produtos = this.produtosSubject.value;
    produtos.forEach((produto: ProdutoInventarioDTO) => {
      if (event.checked) {
        produto.hidden = produto.quantidade_estoque == produto.quantidade_contada;
      } else {
        produto.hidden = false;
      }
    });
    this.produtosSubject.next(produtos);
  }

  addProduto(): void {
    if (!this.form.valid) {
      return;
    }

    if (!this.inventario) {
      this.alertService.showError('Oppss!', 'Salve os dados antes de inserir produtos no inventário');
      return;
    }

    const produtos = this.produtosSubject.value;
    const data: PesquisaProdutoInfo = {
      id_empresa: this.inventario?.id_empresa || 0,
      tipo_estoque: this.inventario?.tipo_estoque || TipoEstoque.TODOS,
      produtos,
    };
    this.dialog.open(PesquisaProdutoComponent, {
      width: '700px',
      data,
    });
  }

  addProdutoToInventario(produto: ProdutoEstoque, quantidade: number): void {
    const produtos = this.produtosSubject.value;
    const id_produto = produto.id ? +produto.id : 0;
    const index = produtos.findIndex((value) => value.id_produto == id_produto);
    const newProduto: ProdutoInventarioDTO = {
      id_produto: produto?.id ? +produto.id : 0,
      nome: produto.nome,
      unidade: produto.unidade,
      quantidade_estoque: produto.quantidade,
      quantidade_contada: quantidade,
      hidden: false,
    };

    if (index >= 0) {
      produtos[index] = {
        ...produtos[index],
        ...newProduto,
      };
    } else {
      produtos.push(newProduto);
    }

    this.updateProdutos(produtos);
  }

  export(): void {
    const produtos = this.produtosSubject.value;

    if (!produtos || produtos.length == 0) {
      this.alertService.showError('Nenhum produto no Inventário.');
      return;
    }

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Inventário');

    const headerStyle: Partial<Style> = {
      font: {
        name: 'Arial', size: 12,
      }};
    worksheet.columns = [
      { header: 'ID', key: 'id_produto', width: 15, style: headerStyle },
      { header: 'Produto', key: 'nome', width: 40, style: headerStyle },
      { header: 'Unidade', key: 'unidade', width: 20, style: headerStyle },
      { header: 'Qtd. Sistema', key: 'quantidade_estoque', width: 20, style: headerStyle },
      { header: 'Qtd. Contada', key: 'quantidade_contada', width: 20, style: headerStyle },
      { header: 'Diferença', key: 'diferenca', width: 20, style: headerStyle },
    ];

    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    columns.forEach((col) => {
      worksheet.getCell(`${col}1`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: '3f51b5',
        }
      };
      worksheet.getCell(`${col}1`).font = {
        color: { argb: 'FFFFFF' },
        bold: true,
      }
    })

    produtos.forEach((produto, index) => {
      const rowNumber = index + 2;
      let row = worksheet.addRow({
        id_produto: produto.id_produto,
        nome: produto.nome,
        unidade: produto.unidade,
        quantidade_estoque: +produto.quantidade_estoque,
        quantidade_contada: +produto.quantidade_contada,
        diferenca: { formula: `E${rowNumber}-D${rowNumber}` },
      }, 'n');
      row.font = { name: 'Arial', size: 14 };

      const diffQtd = produto.quantidade_contada - produto.quantidade_estoque;
      if (diffQtd < 0) {
        worksheet.getCell(`F${rowNumber}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF624A' },
        };
      }
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, 'Inventário.xlsx');
    });
  }
}
