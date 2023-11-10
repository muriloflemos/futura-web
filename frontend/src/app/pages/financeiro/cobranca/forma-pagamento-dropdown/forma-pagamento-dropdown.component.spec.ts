import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormaPagamentoDropdownComponent } from './forma-pagamento-dropdown.component';

describe('FormaPagamentoDropdownComponent', () => {
  let component: FormaPagamentoDropdownComponent;
  let fixture: ComponentFixture<FormaPagamentoDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormaPagamentoDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormaPagamentoDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
