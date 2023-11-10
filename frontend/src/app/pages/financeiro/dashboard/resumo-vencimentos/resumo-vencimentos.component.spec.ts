import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoVencimentosComponent } from './resumo-vencimentos.component';

describe('ResumoVencimentosComponent', () => {
  let component: ResumoVencimentosComponent;
  let fixture: ComponentFixture<ResumoVencimentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResumoVencimentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumoVencimentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
