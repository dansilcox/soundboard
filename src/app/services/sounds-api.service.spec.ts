import { TestBed } from '@angular/core/testing';

import { SoundsApiService } from './sounds-api.service';

describe('SoundsApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SoundsApiService = TestBed.get(SoundsApiService);
    expect(service).toBeTruthy();
  });
});
