import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'add-produto',
  template: `
    <mat-form-field appearance="outline" class="no-label input-quantidade">
      <input matInput type="number" [(ngModel)]="quantidade" onfocus="this.select()" />
    </mat-form-field>
    <app-button icon="add" title="Add" (click)="onClickAdd()"></app-button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
      }

      :host app-button {
        margin-inline-start: 1rem;
      }
      :host .input-quantidade {
        max-width: 5rem;
      }

      :host .no-label ::ng-deep .mat-form-field-wrapper {
        margin: 0;
        padding: 0.5rem 0;
      }

      :host .no-label ::ng-deep .mat-form-field-infix {
        border-top: 0.3em solid transparent;
      }
    `,
  ],
})
export class AddProdutoComponent implements OnInit {
  @Output() onAddProduto = new EventEmitter<number>();

  private _quantidade = 0;
  @Input() set quantidade(value: number) {
    this._quantidade = value;
  };
  get quantidade(): number {
    return this._quantidade;
  }

  constructor() {}

  ngOnInit(): void {}

  onClickAdd(): void {
    this.onAddProduto.emit(this.quantidade);
  }
}
