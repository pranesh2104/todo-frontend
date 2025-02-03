import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn } from '@angular/router';
// import { CoreAuthService } from '@core/services/core-auth.service';

export const authGuard: CanActivateFn = async () => {

  // const coreAuthService = inject(CoreAuthService);

  // const router = inject(Router);

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  // const isAuthenticated = await coreAuthService.checkAuthenticateState();
  // if (isAuthenticated) {
  return true;
  // }
  // else {
  //   router.navigate(['../login']);
  //   return false;
  // }
};
