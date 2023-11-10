import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoMensalComponent } from './resumo-mensal.component';

describe('ResumoMensalComponent', () => {
  let component: ResumoMensalComponent;
  let fixture: ComponentFixture<ResumoMensalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumoMensalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumoMensalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
