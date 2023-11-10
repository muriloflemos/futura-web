import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SavePagamentoDTO } from '../../../../services/pagamento.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
})
export class ViewComponent {
  form = this.formBuilder.group({
    controle: [],
    ajuste: [],
    observacao: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: SavePagamentoDTO
  ) {
    this.form.patchValue({
      controle: data.controle,
      ajuste: data?.ajuste ?? null,
      observacao: data?.observacao ?? null,
    });
  }
}
