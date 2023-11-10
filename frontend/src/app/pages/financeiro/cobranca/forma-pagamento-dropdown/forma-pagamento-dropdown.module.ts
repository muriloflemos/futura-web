import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

import { FormaPagamentoDropdownComponent } from './forma-pagamento-dropdown.component';

@NgModule({
  declarations: [FormaPagamentoDropdownComponent],
  exports: [FormaPagamentoDropdownComponent],
  imports: [CommonModule, FormsModule, MatSelectModule],
})
export class FormaPagamentoDropdownModule {}
