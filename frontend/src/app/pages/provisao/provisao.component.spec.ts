import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisaoComponent } from './provisao.component';

describe('ProvisaoComponent', () => {
  let component: ProvisaoComponent;
  let fixture: ComponentFixture<ProvisaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProvisaoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvisaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
