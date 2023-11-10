import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

export enum ReportType {
  COBRANCA_EFETIVA = 1, COBRANCA_PREVENTIVA = 2
}

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css'],
})
export class RelatoriosComponent implements OnInit {
  reportTypeEnum = ReportType;
  form = this.formBuilder.group({
    tipo: ['', Validators.required],
    inicio: ['', [Validators.required]],
    fim: ['', [Validators.required]],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {}
}
