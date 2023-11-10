import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { InventarioComponent } from './inventario.component';
import { PageHeaderModule } from '../../components/page-header/page-header.module';
import { ButtonModule } from '../../components/button/button.module';
import { PesquisaProdutoModule } from '../../components/pesquisa-produto/pesquisa-produto.module';

const routes: Routes = [
  {
    path: '',
    component: InventarioComponent,
  },
];

@NgModule({
  declarations: [InventarioComponent],
  exports: [InventarioComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatSlideToggleModule,
    ButtonModule,
    PageHeaderModule,
    PesquisaProdutoModule,
  ],
  providers: [DatePipe],
})
export class InventarioModule {}
