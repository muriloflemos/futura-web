import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { PageHeaderModule } from '../../../components/page-header/page-header.module';
import { PagamentosComponent } from './pagamentos.component';
import { ViewModule } from './view/view.module';
import { ObservacaoModule } from '../../financeiro/cobranca/observacao/observacao.module';
import { NumberInputModule } from '../../../components/number-input/number-input.module';

const routes: Routes = [
  {
    path: '',
    component: PagamentosComponent,
  },
];

@NgModule({
  declarations: [PagamentosComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PageHeaderModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCheckboxModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule,
    ViewModule,
    ObservacaoModule,
    NumberInputModule,
  ]
})
export class PagamentosModule { }
