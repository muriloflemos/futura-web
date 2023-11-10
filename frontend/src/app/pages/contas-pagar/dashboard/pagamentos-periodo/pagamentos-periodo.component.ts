import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DashboardService } from '../dashboard.service';
import {
  FindPagamentoDTO,
  PagamentoService,
} from '../../../../services/pagamento.service';
import { TotalizadorDTO } from '../../../../dtos/totalizador.dto';

@Component({
  selector: 'app-pagamentos-periodo',
  templateUrl: './pagamentos-periodo.component.html',
  styleUrls: ['./pagamentos-periodo.component.css'],
})
export class PagamentosPeriodoComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject();
  private isLoaded$ = new BehaviorSubject<boolean>(false);
  isLoaded = this.isLoaded$.asObservable();
  private isLoading$ = new BehaviorSubject<boolean>(false);
  isLoading = this.isLoading$.asObservable();
  private total$ = new BehaviorSubject<number>(0);
  total = this.total$.asObservable();
  private dataSource$ = new BehaviorSubject<TotalizadorDTO[]>([]);
  dataSource = this.dataSource$.asObservable();

  displayedColumns: string[] = ['descricao', 'valor'];

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly pagamentoService: PagamentoService
  ) {}

  ngOnInit(): void {
    this.dashboardService.search$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params: FindPagamentoDTO | null) => {
        if (params) {
          this.isLoaded$.next(true);
          this.isLoading$.next(true);
          this.pagamentoService
            .getResumoPagamentos(params)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((result: TotalizadorDTO[]) => {
              let totalizador = 0;
              if (result.length > 0) {
                for (let item of result) {
                  totalizador += item.valor;
                }
              }
              this.isLoading$.next(false);
              this.total$.next(totalizador);
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
