import { TestBed } from '@angular/core/testing';

import { EstoqueGuard } from './estoque.guard';

describe('EstoqueGuard', () => {
  let guard: EstoqueGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(EstoqueGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
