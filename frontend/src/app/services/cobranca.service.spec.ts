import { TestBed } from '@angular/core/testing';

import { CobrancaService } from './cobranca.service';

describe('CobrancaService', () => {
  let service: CobrancaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CobrancaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
