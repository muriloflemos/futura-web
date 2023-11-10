import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

import { TipoUsuario } from '../../../enums/tipo-usuario.enum';
import { Option } from '../../../interfaces/option';

@Component({
  selector: 'app-pesquisa-usuario',
  templateUrl: './pesquisa-usuario.component.html',
  styleUrls: ['./pesquisa-usuario.component.css'],
})
export class PesquisaUsuarioComponent {
  tipos: Option[] = [
    { key: TipoUsuario.Administrador, label: 'ADMINISTRADOR' },
    { key: TipoUsuario.Faturista, label: 'FATURISTA' },
    { key: TipoUsuario.Estoquista, label: 'ESTOQUISTA' },
    { key: TipoUsuario.AnalistaCredito, label: 'ANALISTA DE CRÉDITO' },
    { key: TipoUsuario.ContasReceber, label: 'CONTAS A RECEBER' },
  ];

  form = this.formBuilder.group({
    nome: [''],
    tipo: [''],
  });

  constructor(
    public dialogRef: MatDialogRef<PesquisaUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
  ) {}

  cancelar(): void {
    this.dialogRef.close();
  }
}
