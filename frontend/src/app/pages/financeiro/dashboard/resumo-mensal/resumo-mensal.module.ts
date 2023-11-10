import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ResumoMensalComponent } from './resumo-mensal.component';

@NgModule({
  declarations: [ResumoMensalComponent],
  exports: [ResumoMensalComponent],
  imports: [CommonModule, MatTableModule, MatCardModule, MatProgressSpinnerModule],
})
export class ResumoMensalModule {}
