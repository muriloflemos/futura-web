import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PesquisaUsuarioComponent } from './pesquisa-usuario.component';

describe('PesquisaUsuarioComponent', () => {
  let component: PesquisaUsuarioComponent;
  let fixture: ComponentFixture<PesquisaUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PesquisaUsuarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PesquisaUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
