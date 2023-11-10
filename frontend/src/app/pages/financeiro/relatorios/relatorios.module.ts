import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { PageHeaderModule } from '../../../components/page-header/page-header.module';
import { RelatoriosComponent } from './relatorios.component';

const routes: Routes = [
  {
    path: '',
    component: RelatoriosComponent,
  },
];

@NgModule({
  declarations: [RelatoriosComponent],
  exports: [RelatoriosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PageHeaderModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
})
export class RelatoriosModule {}
