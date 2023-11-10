import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { endOfDay, parseISO, startOfDay } from 'date-fns';

import { Empresa } from '../../../interfaces/empresa';
import { Modalidade } from '../../../interfaces/modalidade';
import { Carteira } from '../../../interfaces/carteira';
import { StatusVencimento } from '../../../enums/status-vencimento.enum';
import { TipoCobranca } from '../../../enums/tipo-cobranca.enum';

import { LocalStorageService } from '../../../services/local-storage.service';
import { EmpresaService } from '../../../services/empresa.service';
import { ModalidadeService } from '../../../services/modalidade.service';
import { CarteiraService } from '../../../services/carteira.service';
import { DashboardService } from './dashboard.service';
import { FindCobrancaParamsDTO } from '../../../services/cobranca.service';
import { FormaPagamento } from '../../../interfaces/forma-pagamento';
import { FormaPagamentoService } from '../../../services/forma-pagamento.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService],
})
export class DashboardComponent implements OnInit {
  statusVencimento = StatusVencimento;
  tipoCobranca = TipoCobranca;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  private onDestroy$ = new Subject();

  empresas: Empresa[] = [];
  allEmpresas = false;

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
      modalidade: [[]],
      carteira: [[]],
      programacao_inicio: [''],
      programacao_fim: [''],
      forma: [[]],
      pontualidade: [],
      cobranca: [],
      status_cobranca: [],
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

  modalidades: Modalidade[] = [];
  allModalidades = false;

  formasPagamento: FormaPagamento[] = [];
  allFormasPagamento = false;

  carteiras: Carteira[] = [];
  allCarteiras = false;

  constructor(
    private formBuilder: FormBuilder,
    private readonly empresaService: EmpresaService,
    private readonly formaPagamentoService: FormaPagamentoService,
    private readonly modalidadeService: ModalidadeService,
    private readonly carteiraService: CarteiraService,
    private readonly localStorageService: LocalStorageService,
    private readonly dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
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

    const filter = this.localStorageService.get('Financeiro.DashboardComponent.filter');
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
        carteira,
        programacao_inicio,
        programacao_fim,
        forma,
        pontualidade,
        cobranca,
        status_cobranca,
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
      if (situacao) this.form.controls['situacao'].setValue(situacao);
      if (modalidade) this.form.controls['modalidade'].setValue(modalidade);
      if (parceiro) this.form.controls['parceiro'].setValue(parceiro);
      if (vendedor) this.form.controls['vendedor'].setValue(vendedor);
      if (carteira) this.form.controls['carteira'].setValue(carteira);
      if (forma) this.form.controls['forma'].setValue(forma);
      if (pontualidade)
        this.form.controls['pontualidade'].setValue(pontualidade);
      if (cobranca) this.form.controls['cobranca'].setValue(cobranca);
      if (status_cobranca)
        this.form.controls['status_cobranca'].setValue(status_cobranca);
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

  limpar(): void {
    this.form.reset();
    this.localStorageService.remove('Financeiro.DashboardComponent.filter');
  }

  filtrar(): void {
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

    const {
      id_empresa,
      situacao,
      modalidade,
      parceiro,
      vendedor,
      carteira,
      forma,
      pontualidade,
      cobranca,
      status_cobranca,
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

    this.localStorageService.set('DashboardComponent.filter', this.form.value);

    const params: FindCobrancaParamsDTO = {
      id_empresa,
      situacao,
      data_inicio,
      data_fim,
      data_emissao_inicio,
      data_emissao_fim,
      parceiro,
      vendedor,
      modalidade,
      carteira,
      programacao_inicio,
      programacao_fim,
      forma,
      pontualidade,
      cobranca,
      status_cobranca,
    };
    this.dashboardService.search(params);
  }
}
