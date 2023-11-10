import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ResumoVencimentosComponent } from './resumo-vencimentos.component';

@NgModule({
  declarations: [ResumoVencimentosComponent],
  exports: [ResumoVencimentosComponent],
  imports: [CommonModule, MatTableModule, MatCardModule, MatProgressSpinnerModule],
})
export class ResumoVencimentosModule {}
