import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as Highcharts from 'highcharts';
import millify from "millify";

import { DashboardService } from '../dashboard.service';
import {
  FindCobrancaParamsDTO,
  CobrancaService,
} from '../../../../services/cobranca.service';
import { StatusVencimento } from '../../../../enums/status-vencimento.enum';
import { TipoCobranca } from '../../../../enums/tipo-cobranca.enum';
import { TotalizadorDTO } from '../../../../dtos/totalizador.dto';

@Component({
  selector: 'app-totalizador',
  templateUrl: './totalizador.component.html',
  styleUrls: ['./totalizador.component.css']
})
export class TotalizadorComponent implements OnInit, OnDestroy {
  Highcharts = Highcharts;

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

  chart = {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie',
  };
  chartOptions: any = {
    chart: {
      ...this.chart,
    },
    title: {
      text: '',
    },
    tooltip: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          formatter(this: any) {
            // const value = this.y.toLocaleString('pt-br', {
            //   style: 'currency',
            //   currency: 'BRL',
            // });
            const value = millify(this.y, {
              precision: 2,
              decimalSeparator: '.'
            });
            return `${this.key} ${this.percentage.toFixed(2)}% <br> R$ ${value}`;
          },
        },
      },
    },
    series: [
      {
        name: '',
        colorByPoint: true,
        data: [],
      },
    ],
  };

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
            .findTotais(params)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((totais: TotalizadorDTO[]) => {
              const data = [];
              let totalizador = 0;
              if (totais.length > 0) {
                for (let total of totais) {
                  const val = total.valor > 0 ? total.valor : total.valor * (-1);
                  data.push({
                    name: total.label,
                    y: val,
                  });
                  totalizador += val;
                }
              }
              this.chartOptions.series[0].data = data;
              this.isLoading$.next(false);
              this.total$.next(totalizador);
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
