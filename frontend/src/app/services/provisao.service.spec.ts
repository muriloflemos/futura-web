import { TestBed } from '@angular/core/testing';

import { ProvisaoService } from './provisao.service';

describe('ProvisaoService', () => {
  let service: ProvisaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProvisaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
