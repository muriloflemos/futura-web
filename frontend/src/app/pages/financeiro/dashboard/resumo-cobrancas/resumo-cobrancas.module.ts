import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ResumoCobrancasComponent } from './resumo-cobrancas.component';

@NgModule({
  declarations: [ResumoCobrancasComponent],
  exports: [ResumoCobrancasComponent],
  imports: [CommonModule, MatTableModule, MatCardModule, MatProgressSpinnerModule],
})
export class ResumoCobrancasModule {}
