import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PesquisaInventarioComponent } from './pesquisa-inventario.component';

describe('PesquisaInventarioComponent', () => {
  let component: PesquisaInventarioComponent;
  let fixture: ComponentFixture<PesquisaInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PesquisaInventarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PesquisaInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
