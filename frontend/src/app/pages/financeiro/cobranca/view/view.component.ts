import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FormaPagamento } from '../../../../interfaces/forma-pagamento';
import { CobrancaDTO } from '../../../../interfaces/cobranca';
import { AuthService } from 'src/app/services/auth.service';

export interface ViewData {
  formasPagamento: FormaPagamento[];
  controle: number[];
  cobranca?: CobrancaDTO;
}

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
})
export class ViewComponent implements OnInit {
  formasPagamento: FormaPagamento[] = [];

  form = this.formBuilder.group({
    controle: [],
    programacao: [null],
    id_forma_pagamento: [null],
    pontualidade: [null],
    cobranca_preventiva: [null],
    status_cobranca: [null],
    observacao: [null],
    observacao2: [null],
  });

  isAnalistaCredito = false;
  isContasReceber = false;

  constructor(
    private formBuilder: FormBuilder,
    private readonly authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: ViewData
  ) {
    this.isAnalistaCredito =
      this.authService.isAnalistaCredito() || this.authService.isAdmin();
    this.isContasReceber =
      this.authService.isContasReceber() || this.authService.isAdmin();

    this.formasPagamento = data.formasPagamento;
    this.form.patchValue({
      controle: data.controle,
    });

    if (data?.cobranca) {
      this.form.patchValue({
        programacao: data.cobranca?.programacao || null,
        id_forma_pagamento: data.cobranca?.forma || null,
        pontualidade: data.cobranca?.pontualidade || null,
        cobranca_preventiva: data.cobranca?.cobranca || null,
        status_cobranca: data.cobranca?.status_cobranca || null,
        observacao: data.cobranca?.observacao || null,
        observacao2: data.cobranca?.observacao2 || null,
      });
    }
  }

  ngOnInit(): void {}
}
