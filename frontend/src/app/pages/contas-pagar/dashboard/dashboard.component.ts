import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Empresa } from '../../../interfaces/empresa';
import { LocalStorageService } from '../../../services/local-storage.service';
import { EmpresaService } from '../../../services/empresa.service';
import { ModalidadeService } from '../../../services/modalidade.service';
import { CarteiraService } from '../../../services/carteira.service';
import { Modalidade } from '../../../interfaces/modalidade';
import { Carteira } from '../../../interfaces/carteira';
import { DashboardService } from './dashboard.service';
import { FindPagamentoDTO } from 'src/app/services/pagamento.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  private onDestroy$ = new Subject();

  empresas: Empresa[] = [];
  allEmpresas = false;

  modalidades: Modalidade[] = [];
  allModalidades = false;

  carteiras: Carteira[] = [];
  allCarteiras = false;

  form = this.formBuilder.group(
    {
      id_empresa: [[], Validators.required],
      parceiro: [''],
      modalidade: [[]],
      carteira: [[]],
    },
  );

  constructor(
    private formBuilder: FormBuilder,
    private readonly empresaService: EmpresaService,
    private readonly localStorageService: LocalStorageService,
    private readonly modalidadeService: ModalidadeService,
    private readonly carteiraService: CarteiraService,
    private readonly dashboardService: DashboardService,
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

    const filter = this.localStorageService.get('ContasPagar.DashboardComponent.filter');
    if (filter) {
      const {
        id_empresa,
        parceiro,
        modalidade,
        carteira,
      } = filter;
      if (id_empresa) this.form.controls['id_empresa'].setValue(id_empresa);
      if (modalidade) this.form.controls['modalidade'].setValue(modalidade);
      if (parceiro) this.form.controls['parceiro'].setValue(parceiro);
      if (carteira) this.form.controls['carteira'].setValue(carteira);
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  limpar(): void {
    this.form.reset();
    this.localStorageService.remove('ContasPagar.DashboardComponent.filter');
  }

  filtrar(): void {
    this.loadData();
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
    const {
      id_empresa,
      modalidade,
      parceiro,
      carteira,
    } = this.form.value;

    this.localStorageService.set('ContasPagar.DashboardComponent.filter', this.form.value);

    const params: FindPagamentoDTO = {
      id_empresa,
      parceiro,
      modalidade,
      carteira,
    };
    this.dashboardService.search(params);
  }
}
