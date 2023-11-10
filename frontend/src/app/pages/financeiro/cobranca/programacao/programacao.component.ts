import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'programacao',
  templateUrl: './programacao.component.html',
  styleUrls: ['./programacao.component.css'],
})
export class ProgramacaoComponent implements OnInit {
  @Input() value: Date | undefined;
  @Output() change = new EventEmitter<Date | undefined>();

  constructor() {}

  ngOnInit(): void {}

  dateChange(event: MatDatepickerInputEvent<Date>): void {
    this.change.emit(event.value || undefined);
  }

  clean(): void {
    this.value = undefined;
    this.change.emit(undefined);
  }
}
