import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { otpGuard } from './otp.guard';

describe('otpGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => otpGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
