import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HighchartsChartModule } from 'highcharts-angular';

import { TotalizadorComponent } from './totalizador.component';

@NgModule({
  declarations: [TotalizadorComponent],
  exports: [TotalizadorComponent],
  imports: [
    CommonModule,
    NgApexchartsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    HighchartsChartModule,
  ],
})
export class TotalizadorModule {}
