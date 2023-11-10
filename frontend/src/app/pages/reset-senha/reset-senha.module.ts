import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ResetSenhaComponent } from './reset-senha.component';
import { PageHeaderModule } from '../../components/page-header/page-header.module';
import { ButtonModule } from '../../components/button/button.module';

const routes: Routes = [
  {
    path: '',
    component: ResetSenhaComponent,
  },
];

@NgModule({
  declarations: [ResetSenhaComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    PageHeaderModule,
    ButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class ResetSenhaModule {}
