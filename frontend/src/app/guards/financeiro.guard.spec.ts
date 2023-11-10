import { TestBed } from '@angular/core/testing';

import { FinanceiroGuard } from './financeiro.guard';

describe('FinanceiroGuard', () => {
  let guard: FinanceiroGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(FinanceiroGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
