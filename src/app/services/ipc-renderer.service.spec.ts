import { TestBed } from '@angular/core/testing';

import { IpcRendererService } from './ipc-renderer.service';

describe('IpcRendererService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IpcRendererService = TestBed.get(IpcRendererService);
    expect(service).toBeTruthy();
  });
});
