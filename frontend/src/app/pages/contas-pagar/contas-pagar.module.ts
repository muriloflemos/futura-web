import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContasPagarComponent } from './contas-pagar.component';
import { ContasPagarRoutingModule } from './contas-pagar-routing.module';

@NgModule({
  declarations: [ContasPagarComponent],
  imports: [CommonModule, ContasPagarRoutingModule],
})
export class ContasPagarModule { }
