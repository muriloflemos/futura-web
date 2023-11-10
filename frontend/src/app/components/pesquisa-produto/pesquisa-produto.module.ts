import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PesquisaProdutoComponent } from './pesquisa-produto.component';
import { AddProdutoComponent } from './add-produto.component';
import { ButtonModule } from '../button/button.module';

@NgModule({
  declarations: [
    PesquisaProdutoComponent,
    AddProdutoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    ButtonModule,
  ]
})
export class PesquisaProdutoModule { }
