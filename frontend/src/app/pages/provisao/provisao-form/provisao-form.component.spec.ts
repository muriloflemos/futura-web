import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisaoFormComponent } from './provisao-form.component';

describe('ProvisaoFormComponent', () => {
  let component: ProvisaoFormComponent;
  let fixture: ComponentFixture<ProvisaoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProvisaoFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvisaoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
