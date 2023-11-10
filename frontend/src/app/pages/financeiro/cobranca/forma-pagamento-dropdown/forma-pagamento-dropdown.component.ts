import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { FormaPagamento } from '../../../../interfaces/forma-pagamento';

@Component({
  selector: 'forma-pagamento-dropdown',
  templateUrl: './forma-pagamento-dropdown.component.html',
  styleUrls: ['./forma-pagamento-dropdown.component.css'],
})
export class FormaPagamentoDropdownComponent implements OnInit {
  @Input() value: number;
  @Input() formasPagamento: FormaPagamento[] = [];
  @Output() change = new EventEmitter<FormaPagamento | undefined>();

  constructor() {}

  ngOnInit(): void {}

  onChangeValue(event: MatSelectChange): void {
    const formaPagamento = this.formasPagamento.find(
      (value) => value.id == event.value
    );
    this.change.emit(formaPagamento);
  }
}
