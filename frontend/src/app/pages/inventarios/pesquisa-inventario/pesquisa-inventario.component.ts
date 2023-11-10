import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { InventarioStatus } from '../../../enums/inventario-status.enum';

@Component({
  selector: 'app-pesquisa-inventario',
  templateUrl: './pesquisa-inventario.component.html',
  styleUrls: ['./pesquisa-inventario.component.css'],
})
export class PesquisaInventarioComponent {
  form = this.formBuilder.group({
    dataInicio: ['', [Validators.required]],
    dataFim: ['', [Validators.required]],
    status: [''],
  });

  status = [InventarioStatus.ABERTO, InventarioStatus.FINALIZADO];

  constructor(
    public dialogRef: MatDialogRef<PesquisaInventarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder
  ) {
    this.form.patchValue({
      status: data?.status || '',
      dataInicio: data?.dataInicio || '',
      dataFim: data?.dataFim || '',
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
