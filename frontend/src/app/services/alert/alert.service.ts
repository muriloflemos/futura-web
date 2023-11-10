import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ButtonModule } from '../../components/button/button.module';
import { AlertModalComponent, AlertType } from './alert-modal.component';

@Injectable()
export class AlertService {
  constructor(private dialog: MatDialog) {}

  showSuccess(title: string, message?: string): void {
    this.dialog.open(AlertModalComponent, {
      data: {
        title,
        message,
        type: AlertType.SUCCESS,
      },
    });
  }

  showError(title: string, message?: string): void {
    this.dialog.open(AlertModalComponent, {
      data: {
        title,
        message,
        type: AlertType.ERROR,
      },
    });
  }

  showErrors(title: string, message?: string[]): void {
    this.dialog.open(AlertModalComponent, {
      data: {
        title,
        message,
        type: AlertType.MULTIPLE_ERRORS,
      },
    });
  }

  showYesNo(title: string, message?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const dialogRef = this.dialog.open(AlertModalComponent, {
        data: {
          title,
          message,
          type: AlertType.YES_NO,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        resolve(result);
      });
    });
  }
}

@NgModule({
  declarations: [AlertModalComponent],
  exports: [AlertModalComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule, ButtonModule],
  providers: [AlertService],
})
export class AlertModule {}
