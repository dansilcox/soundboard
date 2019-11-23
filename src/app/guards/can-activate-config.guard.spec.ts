import { TestBed, async, inject } from '@angular/core/testing';

import { CanActivateConfigGuard } from './can-activate-config.guard';

describe('CanActivateConfigGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanActivateConfigGuard]
    });
  });

  it('should ...', inject([CanActivateConfigGuard], (guard: CanActivateConfigGuard) => {
    expect(guard).toBeTruthy();
  }));
});
