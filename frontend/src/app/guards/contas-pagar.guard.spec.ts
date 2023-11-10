import { TestBed } from '@angular/core/testing';

import { ContasPagarGuard } from './contas-pagar.guard';

describe('ContasPagarGuard', () => {
  let guard: ContasPagarGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ContasPagarGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
