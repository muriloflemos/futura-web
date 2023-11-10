import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PagamentosPeriodoComponent } from './pagamentos-periodo.component';

@NgModule({
  declarations: [PagamentosPeriodoComponent],
  exports: [PagamentosPeriodoComponent],
  imports: [CommonModule, MatTableModule, MatCardModule, MatProgressSpinnerModule],
})
export class PagamentosPeridoModule {}
