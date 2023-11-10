import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DashboardService } from '../dashboard.service';
import {
  FindCobrancaParamsDTO,
  CobrancaService,
} from '../../../../services/cobranca.service';
import { StatusVencimento } from '../../../../enums/status-vencimento.enum';
import { TipoCobranca } from '../../../../enums/tipo-cobranca.enum';
import { TotalizadorDTO } from '../../../../dtos/totalizador.dto';

@Component({
  selector: 'app-resumo-cobrancas',
  templateUrl: './resumo-cobrancas.component.html',
  styleUrls: ['./resumo-cobrancas.component.css']
})
export class ResumoCobrancasComponent implements OnInit {
  @Input('title') title = '';
  @Input('statusVencimento') statusVencimento: StatusVencimento;
  @Input('tipoCobranca') tipoCobranca?: TipoCobranca;

  private onDestroy$ = new Subject();
  private isLoaded$ = new BehaviorSubject<boolean>(false);
  isLoaded = this.isLoaded$.asObservable();
  private isLoading$ = new BehaviorSubject<boolean>(false);
  isLoading = this.isLoading$.asObservable();
  private total$ = new BehaviorSubject<number>(0);
  total = this.total$.asObservable();
  private dataSource$ = new BehaviorSubject<TotalizadorDTO[]>([]);
  dataSource = this.dataSource$.asObservable();

  displayedColumns: string[] = ['cliente', 'valor'];

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly cobrancaService: CobrancaService
  ) {}

  ngOnInit(): void {
    this.dashboardService.search$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params: FindCobrancaParamsDTO | null) => {
        if (params) {
          params.status_vencimento = this.statusVencimento;
          if (this.tipoCobranca) params.tipo_cobranca = this.tipoCobranca;
          this.isLoaded$.next(true);
          this.isLoading$.next(true);
          this.cobrancaService
            .findDevedores(params)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((result: TotalizadorDTO[]) => {
              const totais = result.slice(0, 30);
              let totalizador = 0;
              if (totais.length > 0) {
                for (let total of totais) {
                  totalizador += total.valor;
                }
              }
              this.isLoading$.next(false);
              this.total$.next(totalizador);
              this.dataSource$.next(totais);
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
