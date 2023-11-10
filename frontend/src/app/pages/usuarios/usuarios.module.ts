import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { UsuariosComponent } from './usuarios.component';
import { PageHeaderModule } from '../../components/page-header/page-header.module';
import { ButtonModule } from '../../components/button/button.module';
import { PesquisaUsuarioComponent } from './pesquisa-usuario/pesquisa-usuario.component';

const routes: Routes = [
  {
    path: '',
    component: UsuariosComponent,
  }
];

@NgModule({
  declarations: [UsuariosComponent, PesquisaUsuarioComponent],
  exports: [UsuariosComponent, PesquisaUsuarioComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    PageHeaderModule,
    ButtonModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ]
})
export class UsuariosModule { }
