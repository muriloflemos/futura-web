import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { InventariosComponent } from './inventarios.component';
import { PageHeaderModule } from '../../components/page-header/page-header.module';
import { ButtonModule } from '../../components/button/button.module';
import { PesquisaInventarioComponent } from './pesquisa-inventario/pesquisa-inventario.component';

const routes: Routes = [
  {
    path: '',
    component: InventariosComponent,
  }
];

@NgModule({
  declarations: [InventariosComponent, PesquisaInventarioComponent],
  exports: [InventariosComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    PageHeaderModule,
    ButtonModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class InventariosModule { }
