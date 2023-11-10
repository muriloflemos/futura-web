import {
  Component,
  OnInit,
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
  selector: 'observacao',
  templateUrl: './observacao.component.html',
  styleUrls: ['./observacao.component.css'],
})
export class ObservacaoComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('input') input: ElementRef;
  @Input() value = '';
  @Input() disabled = false;
  @Output() textChange = new EventEmitter<string>();

  onDestroy$ = new Subject();

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.onDestroy$),
        filter(Boolean),
        debounceTime(600),
        distinctUntilChanged(),
        tap(() => {
          this.textChange.emit(this.input.nativeElement.value);
        })
      )
      .subscribe();
  }
}
