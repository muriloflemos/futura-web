import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatSelectChange } from '@angular/material/select';
import { SelectionModel } from '@angular/cdk/collections';
import { startOfDay, endOfDay, parseISO, format, addMinutes } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';

import { ViewComponent } from './view/view.component';
import { Empresa } from '../../../interfaces/empresa';
import { CobrancaDTO } from '../../../interfaces/cobranca';
import { SaveCobrancaDTO } from '../../../dtos/save-cobranca.dto';
import { FormaPagamento } from '../../../interfaces/forma-pagamento';
import { Modalidade } from '../../../interfaces/modalidade';
import { Carteira } from '../../../interfaces/carteira';

import { LocalStorageService } from '../../../services/local-storage.service';
import {
  CobrancaService,
  FindCobrancaParamsDTO,
} from '../../../services/cobranca.service';
import { EmpresaService } from '../../../services/empresa.service';
import { AlertService } from '../../../services/alert/alert.service';
import { FormaPagamentoService } from '../../../services/forma-pagamento.service';
import { ModalidadeService } from '../../../services/modalidade.service';
import { CarteiraService } from '../../../services/carteira.service';
import { AuthService } from 'src/app/services/auth.service';

type SelectOption = {
  id: number;
  label: string;
};

@Component({
  selector: 'app-cobranca',
  templateUrl: './cobranca.component.html',
  styleUrls: ['./cobranca.component.css'],
})
export class CobrancaComponent implements OnInit, OnDestroy {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  private onDestroy$ = new Subject();

  displayedColumns: string[] = [
    'select',
    'unidade',
    'parceiro',
    'vendedor',
    'vencimento',
    'valor',
    'numero',
    'modalidade',
    'carteira',
    'programacao',
    'forma',
    'pontualidade',
    'cobranca',
    'statusCobranca',
    'observacao',
    'observacao2',
    'actions',
  ];
  total = 0;
  active = false;

  empresas: Empresa[] = [];
  allEmpresas = false;

  private dataSubject = new BehaviorSubject<CobrancaDTO[]>([]);
  dataSource$ = this.dataSubject.asObservable();
  selection = new SelectionModel<CobrancaDTO>(true, []);

  form = this.formBuilder.group(
    {
      id_empresa: [[], Validators.required],
      data_inicio: [''],
      data_fim: [''],
      data_emissao_inicio: [''],
      data_emissao_fim: [''],
      situacao: [],
      parceiro: [''],
      vendedor: [''],
      numero: [''],
      modalidade: [[]],
      carteira: [[]],
      programacao_inicio: [''],
      programacao_fim: [''],
      status_programacao: [],
      forma: [[]],
      pontualidade: [[]],
      cobranca: [[]],
      status_cobranca: [[]],
      status_observacao: [],
      status_observacao2: [],
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

  formasPagamento: FormaPagamento[] = [];
  allFormasPagamento = false;

  carteiras: Carteira[] = [];
  allCarteiras = false;

  pontualidades: string[] = ['A', 'B', 'C'];
  allPontualidades = false;

  cobrancasPreventivas: SelectOption[] = [
    { id: 1, label: 'Sim' },
    { id: 2, label: 'Não' },
    { id: 3, label: 'Concluída' },
  ];
  allCobrancasPreventivas = false;

  statusCobranca: SelectOption[] = [
    { id: 1, label: 'Pendente' },
    { id: 2, label: 'Concluído' },
    { id: 3, label: 'Enviado' },
  ];
  allStatusCobranca = false;

  isAnalistaCredito = false;
  isContasReceber = false;

  valorTotal = 0;

  constructor(
    private formBuilder: FormBuilder,
    private readonly cobrancaService: CobrancaService,
    private readonly empresaService: EmpresaService,
    private readonly formaPagamentoService: FormaPagamentoService,
    private readonly modalidadeService: ModalidadeService,
    private readonly carteiraService: CarteiraService,
    private readonly alertService: AlertService,
    private readonly localStorageService: LocalStorageService,
    private readonly authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isAnalistaCredito =
      this.authService.isAnalistaCredito() || this.authService.isAdmin();
    this.isContasReceber =
      this.authService.isContasReceber() || this.authService.isAdmin();

    this.empresaService
      .getAll()
      .pipe(take(1))
      .subscribe((result: Empresa[]) => (this.empresas = result));
    this.loadFormasPagamento();
    this.loadModalidades();
    this.loadCarteiras();

    this.form.get('id_empresa')?.valueChanges.subscribe((value) => {
      this.allEmpresas = value.length == this.empresas.length;
    });

    this.form.get('modalidade')?.valueChanges.subscribe((value) => {
      this.allModalidades = value.length == this.modalidades.length;
    });

    this.form.get('forma')?.valueChanges.subscribe((value) => {
      this.allFormasPagamento = value.length == this.formasPagamento.length;
    });

    this.form.get('pontualidade')?.valueChanges.subscribe((value) => {
      this.allPontualidades = value.length == this.pontualidades.length;
    });

    this.form.get('cobranca')?.valueChanges.subscribe((value) => {
      this.allCobrancasPreventivas =
        value.length == this.cobrancasPreventivas.length;
    });

    this.form.get('status_cobranca')?.valueChanges.subscribe((value) => {
      this.allStatusCobranca = value.length == this.statusCobranca.length;
    });

    const filter = this.localStorageService.get('CobrancaComponent.filter');
    if (filter) {
      const {
        id_empresa,
        data_inicio,
        data_fim,
        data_emissao_inicio,
        data_emissao_fim,
        situacao,
        modalidade,
        parceiro,
        vendedor,
        numero,
        carteira,
        programacao_inicio,
        programacao_fim,
        status_programacao,
        forma,
        pontualidade,
        cobranca,
        status_cobranca,
        status_observacao,
        status_observacao2,
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
      if (programacao_inicio)
        this.form.controls['programacao_inicio'].setValue(
          parseISO(programacao_inicio)
        );
      if (programacao_fim)
        this.form.controls['programacao_fim'].setValue(
          parseISO(programacao_fim)
        );
      if (status_programacao)
        this.form.controls['status_programacao'].setValue(status_programacao);
      if (situacao) this.form.controls['situacao'].setValue(situacao);
      if (modalidade) this.form.controls['modalidade'].setValue(modalidade);
      if (parceiro) this.form.controls['parceiro'].setValue(parceiro);
      if (vendedor) this.form.controls['vendedor'].setValue(vendedor);
      if (numero) this.form.controls['numero'].setValue(numero);
      if (carteira) this.form.controls['carteira'].setValue(carteira);
      if (forma) this.form.controls['forma'].setValue(forma);
      if (pontualidade)
        this.form.controls['pontualidade'].setValue(pontualidade);
      if (cobranca) this.form.controls['cobranca'].setValue(cobranca);
      if (status_cobranca)
        this.form.controls['status_cobranca'].setValue(status_cobranca);
      if (status_observacao)
        this.form.controls['status_observacao'].setValue(status_observacao);
      if (status_observacao2)
        this.form.controls['status_observacao2'].setValue(status_observacao2);
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
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

  toggleFormasPagamento(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        forma: this.formasPagamento.map((o) => o.id),
      });
    } else {
      this.form.patchValue({
        forma: [],
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

  togglePontualidades(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        pontualidade: this.pontualidades.map((o) => o),
      });
    } else {
      this.form.patchValue({
        pontualidade: [],
      });
    }
  }

  toggleCobrancasPreventivas(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        cobranca: this.cobrancasPreventivas.map((o) => o.id),
      });
    } else {
      this.form.patchValue({
        cobranca: [],
      });
    }
  }

  toggleStatusCobranca(checked: boolean): void {
    if (checked) {
      this.form.patchValue({
        status_cobranca: this.statusCobranca.map((o) => o.id),
      });
    } else {
      this.form.patchValue({
        status_cobranca: [],
      });
    }
  }

  limpar(): void {
    this.form.reset();
    this.localStorageService.remove('CobrancaComponent.filter');
  }

  filtrar(): void {
    this.sort = 'vencimento';
    this.sortDirection = 'asc';
    this.active = true;
    this.clearSelection();
    this.loadData();
  }

  private loadFormasPagamento(): void {
    this.formaPagamentoService
      .findAll()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((results) => {
        this.formasPagamento = results;
      });
  }

  private loadModalidades(): void {
    this.modalidadeService
      .findAll()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((results) => {
        this.modalidades = results;
      });
  }

  private loadCarteiras(): void {
    this.carteiraService
      .findAll()
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
      situacao,
      modalidade,
      parceiro,
      vendedor,
      numero,
      carteira,
      forma,
      pontualidade,
      cobranca,
      status_cobranca,
      status_programacao,
      status_observacao,
      status_observacao2,
    } = this.form.value;
    let {
      data_inicio,
      data_fim,
      data_emissao_inicio,
      data_emissao_fim,
      programacao_inicio,
      programacao_fim,
    } = this.form.value;

    if (data_inicio && data_fim) {
      data_inicio = startOfDay(data_inicio).toISOString();
      data_fim = endOfDay(data_fim).toISOString();
    }

    if (data_emissao_inicio && data_emissao_fim) {
      data_emissao_inicio = startOfDay(data_emissao_inicio).toISOString();
      data_emissao_fim = endOfDay(data_emissao_fim).toISOString();
    }

    if (programacao_inicio && programacao_fim) {
      programacao_inicio = startOfDay(programacao_inicio).toISOString();
      programacao_fim = endOfDay(programacao_fim).toISOString();
    }

    this.localStorageService.set('CobrancaComponent.filter', this.form.value);

    const params: FindCobrancaParamsDTO = {
      id_empresa,
      data_inicio,
      data_fim,
      data_emissao_inicio,
      data_emissao_fim,
      situacao,
      parceiro,
      vendedor,
      numero: numero || 0,
      modalidade,
      carteira,
      programacao_inicio,
      programacao_fim,
      status_programacao,
      forma,
      pontualidade,
      cobranca,
      status_cobranca,
      sort: this.sort,
      sortDirection: this.sortDirection,
      status_observacao,
      status_observacao2,
    };
    this.cobrancaService
      .findAll(params)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (results: CobrancaDTO[]) => {
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

  calcValorTotal(results: CobrancaDTO[]): void {
    this.valorTotal = 0;
    results.forEach((value: CobrancaDTO) => (this.valorTotal += value.valor));
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

  view(cobranca: CobrancaDTO): void {
    const dialogRef = this.dialog.open(ViewComponent, {
      data: {
        formasPagamento: this.formasPagamento,
        controle: [cobranca.id],
        cobranca,
      },
    });
    dialogRef.afterClosed().subscribe((result: SaveCobrancaDTO) => {
      if (result) {
        this.saveCobranca(result);
      }
    });
  }

  editSelected(): void {
    if (this.selection.selected.length == 0) return;
    const ids = this.selection.selected.map((value) => value.id);
    const dialogRef = this.dialog.open(ViewComponent, {
      data: {
        formasPagamento: this.formasPagamento,
        controle: ids,
      },
    });
    dialogRef.afterClosed().subscribe((result: SaveCobrancaDTO) => {
      if (result) {
        this.saveCobranca(result, true);
      }
    });
  }

  onChangeFormaPagamento(
    formaPagamento: FormaPagamento | undefined,
    cobranca: CobrancaDTO
  ): void {
    this.saveCobranca({
      controle: [cobranca.id],
      id_forma_pagamento: formaPagamento ? formaPagamento.id : 0,
    });
  }

  onChangePontualidade(event: MatSelectChange, cobranca: CobrancaDTO): void {
    this.saveCobranca({
      controle: [cobranca.id],
      pontualidade: event.value || '',
    });
  }

  onChangeProgramacao(date: Date | undefined, cobranca: CobrancaDTO): void {
    this.saveCobranca({
      controle: [cobranca.id],
      programacao: date || null,
    });
  }

  onChangeCobranca(event: MatSelectChange, cobranca: CobrancaDTO): void {
    this.saveCobranca({
      controle: [cobranca.id],
      cobranca_preventiva: +event.value || null,
    });
  }

  onChangeStatusCobranca(event: MatSelectChange, cobranca: CobrancaDTO): void {
    this.saveCobranca({
      controle: [cobranca.id],
      status_cobranca: +event.value || null,
    });
  }

  onChangeObservacao(value: string, cobranca: CobrancaDTO): void {
    this.saveCobranca({
      controle: [cobranca.id],
      observacao: value || null,
    });
  }

  onChangeObservacao2(value: string, cobranca: CobrancaDTO): void {
    this.saveCobranca({
      controle: [cobranca.id],
      observacao2: value || null,
    });
  }

  private saveCobranca(data: SaveCobrancaDTO, lote = false): void {
    this.cobrancaService
      .save(data, lote)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        (results: CobrancaDTO[]) => {
          const datasourceTemp = this.dataSubject.value;
          const newDatasource = datasourceTemp.map(
            (value) => results.find((r) => r.id == value.id) || value
          );
          this.dataSubject.next(newDatasource);
          this.clearSelection();
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

  private getFormaPagamentoLabel(id: number | undefined): string {
    if (!id) return '';
    const forma = this.formasPagamento.find((value) => value.id === id);
    return forma?.nome ?? '';
  }

  private getCobrancaLabel(id: number | undefined): string {
    if (!id) return '';
    switch (id) {
      case 1: return 'Sim';
      case 2: return 'Não';
      case 3: return 'Concluída';
      default: return '';
    }
  }

  private getStatusCobrancaLabel(id: number | undefined): string {
    if (!id) return '';
    switch (id) {
      case 1: return 'Pendente';
      case 2: return 'Concluído';
      case 3: return 'Enviado';
      default: return '';
    }
  }

  export(): void {
    const datasource = this.dataSubject.value;

    if (!datasource || datasource.length == 0) {
      return;
    }

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Cobrança Preventiva');

    worksheet.columns = [
      { header: 'Unidade', key: 'unidade', width: 20 },
      { header: 'Parceiro', key: 'parceiro', width: 60 },
      { header: 'Vendedor', key: 'vendedor', width: 60 },
      { header: 'Venc. Original', key: 'vencimento', width: 20 },
      { header: 'Valor', key: 'valor', width: 20 },
      { header: 'Número', key: 'numero', width: 20 },
      { header: 'Modalidade', key: 'modalidade', width: 40 },
      { header: 'Carteira', key: 'carteira', width: 40 },
      { header: 'Prog. Pgto.', key: 'programacao', width: 20 },
      { header: 'Forma Pgto.', key: 'forma', width: 20 },
      { header: 'Pont.', key: 'pontualidade', width: 20 },
      { header: 'Cob. Prev.', key: 'cobranca', width: 20 },
      { header: 'Status Cob. Prev.', key: 'status_cobranca', width: 20 },
      { header: 'Obs. Analista de Crédito', key: 'observacao', width: 60 },
      { header: 'Obs. Contas a Receber', key: 'observacao2', width: 60 },
    ];

    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
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
        vendedor: item.vendedor,
        vencimento: format(addMinutes(new Date(item.vencimento), timezoneOffset), 'dd/MM/yyyy'),
        valor: item.valor,
        numero: item.numero,
        modalidade: item.modalidade,
        carteira: item.carteira,
        programacao: item.programacao ? format(new Date(item.programacao), 'dd/MM/yyyy') : '',
        forma: this.getFormaPagamentoLabel(item.forma),
        pontualidade: item.pontualidade,
        cobranca: this.getCobrancaLabel(item.cobranca),
        status_cobranca: this.getStatusCobrancaLabel(item.status_cobranca),
        observacao: item.observacao,
        observacao2: item.observacao2,
      }, 'n');
      row.font = { name: 'Arial', size: 12 };
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, 'Cobrança Preventiva.xlsx');
    });
  }
}
