import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProvisaoDTO } from '../../../interfaces/provisao';
import { Empresa } from '../../../interfaces/empresa';
import { Modalidade } from '../../../interfaces/modalidade';

export interface ProvisaoFormData {
  provisao: ProvisaoDTO;
  empresas: Empresa[];
  modalidades: Modalidade[];
}

@Component({
  selector: 'app-provisao-form',
  templateUrl: './provisao-form.component.html',
  styleUrls: ['./provisao-form.component.css']
})
export class ProvisaoFormComponent {
  empresas: Empresa[] = [];
  modalidades: Modalidade[] = [];

  form = this.formBuilder.group({
    id: [null],
    id_empresa: [null, [Validators.required]],
    id_modalidade: [null, [Validators.required]],
    parceiro: [null],
    vencimento: [null, [Validators.required]],
    valor: [null, [Validators.required]],
  });

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: ProvisaoFormData,
  ) {
    const { provisao, empresas, modalidades } = data;
    this.empresas = empresas;
    this.modalidades = modalidades;

    if (provisao) {
      this.form.patchValue({
        id: provisao?.id ?? null,
        id_empresa: provisao.id_empresa,
        id_modalidade: provisao.id_modalidade,
        parceiro: provisao?.parceiro ?? '',
        vencimento: provisao.vencimento,
        valor: Number(provisao.valor),
      });
    }
  }
}
