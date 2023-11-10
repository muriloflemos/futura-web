import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { NumberInputComponent } from './number-input.component';

@NgModule({
  declarations: [NumberInputComponent],
  exports: [NumberInputComponent],
  imports: [CommonModule, MatInputModule],
})
export class NumberInputModule { }
