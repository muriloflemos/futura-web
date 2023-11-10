import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export enum AlertType {
  ERROR = 1,
  MULTIPLE_ERRORS = 2,
  YES_NO = 3,
  SUCCESS = 4,
}

interface IAlertOptions {
  type: AlertType;
  title: string;
  message?: string[];
}

@Component({
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.css']
})
export class AlertModalComponent {
  AlertType = AlertType;

  constructor(@Inject(MAT_DIALOG_DATA) public data: IAlertOptions) {}
}
