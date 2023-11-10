import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoCobrancasComponent } from './resumo-cobrancas.component';

describe('ResumoCobrancasComponent', () => {
  let component: ResumoCobrancasComponent;
  let fixture: ComponentFixture<ResumoCobrancasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumoCobrancasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumoCobrancasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
