import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'app-resumo-vencimentos',
  templateUrl: './resumo-vencimentos.component.html',
  styleUrls: ['./resumo-vencimentos.component.css'],
})
export class ResumoVencimentosComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  private isLoaded$ = new BehaviorSubject<boolean>(false);
  isLoaded = this.isLoaded$.asObservable();
  private isLoading$ = new BehaviorSubject<boolean>(false);
  isLoading = this.isLoading$.asObservable();
  private dataSource$ = new BehaviorSubject<TotalizadorDTO[]>([]);
  dataSource = this.dataSource$.asObservable();

  displayedColumns: string[] = ['descricao', 'valor'];

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly cobrancaService: CobrancaService
  ) {}

  ngOnInit(): void {
    this.dashboardService.search$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params: FindCobrancaParamsDTO | null) => {
        if (params) {
          params.status_vencimento = StatusVencimento.VENCIDOS;
          params.tipo_cobranca = TipoCobranca.DEBITO;
          this.isLoaded$.next(true);
          this.isLoading$.next(true);
          this.cobrancaService
            .getResumoVencimentos(params)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((result: TotalizadorDTO[]) => {
              this.isLoading$.next(false);
              this.dataSource$.next(result);
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
