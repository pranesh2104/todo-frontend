import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const otpGuard: CanActivateFn = () => {

  const authService = inject(AuthService);

  const router = inject(Router);
  if (!authService.getRegistrationEmail()) {
    router.navigate(['/signup']);
    return false;
  }
  return true;

};
