import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

import { ObservacaoComponent } from './observacao.component';

@NgModule({
  declarations: [ObservacaoComponent],
  imports: [CommonModule, MatInputModule],
  exports: [ObservacaoComponent],
})
export class ObservacaoModule {}
