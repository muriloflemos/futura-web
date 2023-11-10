import {
  Component,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, tap, filter } from 'rxjs/operators';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.css']
})
export class NumberInputComponent implements OnDestroy, AfterViewInit {
  @ViewChild('input') input: ElementRef;
  @Input() value = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<number>();

  onDestroy$ = new Subject();

  constructor() {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.onDestroy$),
        tap((event) => {
          if ((event as KeyboardEvent).key === 'Enter') {
            this.valueChange.emit(Number(this.input.nativeElement.value));
          }
        })
      )
      .subscribe();

    fromEvent(this.input.nativeElement, 'blur')
      .pipe(
        takeUntil(this.onDestroy$),
        tap(() => {
          if (this.value !== this.input.nativeElement.value) {
            this.valueChange.emit(Number(this.input.nativeElement.value));
          }
        })
      )
      .subscribe();
  }
}
