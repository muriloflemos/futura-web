import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Sort, SortDirection } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { endOfDay, parseISO, startOfDay, format, addMinutes } from 'date-fns';
import { Empresa } from '../../../interfaces/empresa';
import { LocalStorageService } from '../../../services/local-storage.service';
import { EmpresaService } from '../../../services/empresa.service';
import { AlertService } from '../../../services/alert/alert.service';
import { ModalidadeService } from '../../../services/modalidade.service';
import { CarteiraService } from '../../../services/carteira.service';
import { PagamentoService, SavePagamentoDTO } from 'src/app/services/pagamento.service';
import { PagamentoDTO } from '../../../interfaces/pagamento';
import { Modalidade } from '../../../interfaces/modalidade';
import { Carteira } from '../../../interfaces/carteira';
import { FindPagamentoDTO } from 'src/app/services/pagamento.service';
import { ViewComponent } from './view/view.component';

@Component({
  selector: 'app-pagamentos',
  templateUrl: './pagamentos.component.html',
  styleUrls: ['./pagamentos.component.css']
})
export class PagamentosComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  private onDestroy$ = new Subject();

  displayedColumns: string[] = [
    'select',
    'unidade',
    'parceiro',
    'vencimento',
    'valor',
    'ajuste',
    'total',
    'numero',
    'modalidade',
    'carteira',
    'observacao',
  ];
  active = false;

  empresas: Empresa[] = [];
  allEmpresas = false;

  private dataSubject = new BehaviorSubject<PagamentoDTO[]>([]);
  dataSource$ = this.dataSubject.asObservable();
  selection = new SelectionModel<PagamentoDTO>(true, []);

  form = this.formBuilder.group(
    {
      id_empresa: [[], Validators.required],
      data_inicio: [''],
      data_fim: [''],
      data_emissao_inicio: [''],
      data_emissao_fim: [''],
      parceiro: [''],
      numero: [''],
      modalidade: [[]],
      carteira: [[]],
    },
    {
      validators: (control: AbstractControl): ValidationErrors | null => {
        const dataInicio = control.get('data_inicio')?.value;
        const dataFim = control.get('data_fim')?.value;
        const dataEmissaoInicio = control.get('data_emissao_inicio')?.value;
        const dataEmissaoFim = control.get('data_emissao_fim')?.value;
        if ((dataInicio && dataFim) || (dataEmissaoInicio && dataEmissaoFim)) {
          return null;
        }
        return { noMatch: true };
      },
    }
  );

  sort = 'vencimento';
  sortDirection: SortDirection = 'asc';

  modalidades: Modalidade[] = [];
  allModalidades = false;

  carteiras: Carteira[] = [];
  allCarteiras = false;

  valorTotal = 0;
  valorTotalAjuste = 0;
  valorTotalComAjuste = 0;

  constructor(
    private formBuilder: FormBuilder,
    private readonly empresaService: EmpresaService,
    private readonly localStorageService: LocalStorageService,
    private readonly modalidadeService: ModalidadeService,
    private readonly carteiraService: CarteiraService,
    private readonly pagamentoService: PagamentoService,
    private readonly alertService: AlertService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.empresaService
      .getAll()
      .pipe(take(1))
      .subscribe((result: Empresa[]) => (this.empresas = result));
    this.loadModalidades();
    this.loadCarteiras();

    this.form.get('id_empresa')?.valueChanges.subscribe((value) => {
      this.allEmpresas = value.length == this.empresas.length;
    });

    const filter = this.localStorageService.get('PagamentosComponent.filter');
    if (filter) {
      const {
        id_empresa,
        data_inicio,
        data_fim,
        data_emissao_inicio,
        data_emissao_fim,
        parceiro,
        numero,
        modalidade,
        carteira,
      } = filter;
      if (id_empresa) this.form.controls['id_empresa'].setValue(id_empresa);
      if (data_inicio)
        this.form.controls['data_inicio'].setValue(parseISO(data_inicio));
      if (data_fim) this.form.controls['data_fim'].setValue(parseISO(data_fim));
      if (data_emissao_inicio)
        this.form.controls['data_emissao_inicio'].setValue(
          parseISO(data_emissao_inicio)
        );
      if (data_emissao_fim)
        this.form.controls['data_emissao_fim'].setValue(
          parseISO(data_emissao_fim)
        );
      if (modalidade) this.form.controls['modalidade'].setValue(modalidade);
      if (parceiro) this.form.controls['parceiro'].setValue(parceiro);
      if (numero) this.form.controls['numero'].setValue(numero);
      if (carteira) this.form.controls['carteira'].setValue(carteira);
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  limpar(): void {
    this.form.reset();
    this.localStorageService.remove('PagamentosComponent.filter');
  }

  filtrar(): void {
    this.sort = 'vencimento';
    this.sortDirection = 'asc';
    this.active = true;
    this.clearSelection();
    this.loadData();
  }

  sortChange(sortState: Sort): void {
    this.clearSelection();
    this.sort = sortState.active;
    this.sortDirection = sortState.direction;
    this.loadData();
  }

  clearSelection() {
    this.selection.clear();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSubject.value.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.clearSelection();
      return;
    }

    this.selection.select(...this.dataSubject.value);
  }

  toggleEmpresas(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        id_empresa: this.empresas.map((o) => o.id),
      });
    } else {
      this.form.patchValue({
        id_empresa: [],
      });
    }
  }

  toggleModalidades(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        modalidade: this.modalidades.map((o) => o.id),
      });
    } else {
      this.form.patchValue({
        modalidade: [],
      });
    }
  }

  toggleCarteiras(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        carteira: this.carteiras.map((o) => o.id),
      });
    } else {
      this.form.patchValue({
        carteira: [],
      });
    }
  }

  private loadModalidades(): void {
    this.modalidadeService
      .findAllFutura()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((results) => {
        this.modalidades = results;
      });
  }

  private loadCarteiras(): void {
    this.carteiraService
      .findAllFutura()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((results) => {
        this.carteiras = results;
      });
  }

  private loadData(): void {
    if (!this.form.valid) return;

    this.dataSubject.next([]);
    this.loadingSubject.next(true);

    const {
      id_empresa,
      modalidade,
      parceiro,
      numero,
      carteira,
    } = this.form.value;
    let {
      data_inicio,
      data_fim,
      data_emissao_inicio,
      data_emissao_fim,
    } = this.form.value;

    if (data_inicio && data_fim) {
      data_inicio = format(startOfDay(data_inicio), 'yyyy-MM-dd HH:mm:ss');
      data_fim = format(endOfDay(data_fim), 'yyyy-MM-dd HH:mm:ss');
    }

    if (data_emissao_inicio && data_emissao_fim) {
      data_emissao_inicio = startOfDay(data_emissao_inicio).toISOString();
      data_emissao_fim = endOfDay(data_emissao_fim).toISOString();
    }

    this.localStorageService.set('PagamentosComponent.filter', this.form.value);

    const params: FindPagamentoDTO = {
      id_empresa,
      data_inicio,
      data_fim,
      data_emissao_inicio,
      data_emissao_fim,
      parceiro,
      numero: numero || 0,
      modalidade,
      carteira,
      sort: this.sort,
      sortDirection: this.sortDirection,
    };
    this.pagamentoService
      .findAll(params)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (results: PagamentoDTO[]) => {
          this.calcValorTotal(results);
          this.dataSubject.next(results);
          this.loadingSubject.next(false);
        },
        () => {
          this.calcValorTotal([]);
          this.dataSubject.next([]);
          this.loadingSubject.next(false);
        }
      );
  }

  calcValorTotal(results: PagamentoDTO[]): void {
    this.valorTotal = 0;
    this.valorTotalAjuste = 0;
    this.valorTotalComAjuste = 0;
    results.forEach((value: PagamentoDTO) => {
      this.valorTotal += value.valor;
      this.valorTotalAjuste += value.ajuste ?? 0;
      this.valorTotalComAjuste += value.valor + value.ajuste;
    });
  }

  onChangeObservacao(value: string, pagamento: PagamentoDTO): void {
    this.savePagamento({
      controle: [pagamento.id],
      observacao: value,
    });
  }

  onChangeAJuste(value: number, pagamento: PagamentoDTO): void {
    if (pagamento.ajuste === value) return;
    this.savePagamento({
      controle: [pagamento.id],
      ajuste: value !== 0 ? value : null,
    });
  }

  savePagamento(data: SavePagamentoDTO): void {
    this.pagamentoService
      .save(data)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (results: PagamentoDTO[]) => {
          const datasourceTemp = this.dataSubject.value;
          const newDatasource = datasourceTemp.map(
            (value) => results.find((r) => r.id == value.id) || value
          );
          this.dataSubject.next(newDatasource);
          this.clearSelection();
          this.calcValorTotal(newDatasource);
        },
        (err) => {
          console.log(err);
          this.alertService.showError(
            'Erro',
            'Não foi possível salvar os dados, tente novamente em alguns instantes ou entre em contato com o suporte!'
          );
        }
      );
  }

  editSelected(): void {
    if (this.selection.selected.length == 0) return;
    const ids = this.selection.selected.map((value) => value.id);
    const dialogRef = this.dialog.open(ViewComponent, {
      data: {
        controle: ids,
      },
    });
    dialogRef.afterClosed().subscribe((result: SavePagamentoDTO) => {
      if (result) {
        this.savePagamento(result);
      }
    });
  }

  export(): void {
    const datasource = this.dataSubject.value;

    if (!datasource || datasource.length == 0) {
      return;
    }

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Pagamentos');

    worksheet.columns = [
      { header: 'Unidade', key: 'unidade', width: 20 },
      { header: 'Parceiro', key: 'parceiro', width: 60 },
      { header: 'Vencimento', key: 'vencimento', width: 20 },
      { header: 'Valor', key: 'valor', width: 20 },
      { header: 'Ajuste', key: 'ajuste', width: 20 },
      { header: 'Total', key: 'valorTotal', width: 20 },
      { header: 'Número', key: 'numero', width: 20 },
      { header: 'Modalidade', key: 'modalidade', width: 40 },
      { header: 'Carteira', key: 'carteira', width: 40 },
      { header: 'Observação', key: 'observacao', width: 40 },
    ];

    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
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
        name: 'Arial',
        size: 12,
      }
    });

    const timezoneOffset = new Date().getTimezoneOffset();
    datasource.forEach((item) => {
      let row = worksheet.addRow({
        unidade: item.unidade,
        parceiro: item.parceiro,
        vencimento: format(addMinutes(new Date(item.vencimento), timezoneOffset), 'dd/MM/yyyy'),
        valor: item.valor,
        ajuste: item.ajuste,
        valorTotal: item.valorTotal,
        numero: item.numero,
        modalidade: item.modalidade,
        carteira: item.carteira,
        observacao: item.observacao,
      }, 'n');
      row.font = { name: 'Arial', size: 12 };
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, 'Pagamentos.xlsx');
    });
  }
}
