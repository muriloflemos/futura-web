import { TestBed } from '@angular/core/testing';

import { ModalidadeService } from './modalidade.service';

describe('ModalidadeService', () => {
  let service: ModalidadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalidadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
