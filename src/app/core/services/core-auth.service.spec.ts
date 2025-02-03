import { TestBed } from '@angular/core/testing';

import { CoreAuthService } from './coreAuth.service';

describe('AuthService', () => {
  let service: CoreAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
