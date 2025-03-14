import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CoreAuthService } from '@core/services/core-auth.service';
import { HeaderService } from '@core/services/header.service';
import { BehaviorSubject, catchError, from, switchMap, throwError } from 'rxjs';
import { SERVER_REQUEST } from '../../../server.token';
import { isPlatformServer } from '@angular/common';

let isRefreshing = false;

const refreshSubject = new BehaviorSubject<boolean>(false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    const server = inject(SERVER_REQUEST);

    if (server) {
      req = req.clone({
        setHeaders: { Cookie: server?.headers['cookie'] }
      });
    }
    return next(req);
  }

  const coreAuthService = inject(CoreAuthService);

  const headerService = inject(HeaderService);

  const router = inject(Router);

  const authReq = addToken(coreAuthService, req, headerService);

  return next(authReq).pipe(
    catchError(error => {
      if (error && error.status === 401 && !isRefreshing) {
        return handle401Error(authReq, next, coreAuthService, router, headerService);
      }
      return throwError(() => error);
    })
  );
};

const handle401Error = (req: HttpRequest<unknown>, next: HttpHandlerFn, coreAuthService: CoreAuthService, router: Router, headerService: HeaderService) => {
  isRefreshing = true;
  refreshSubject.next(false);

  return from(coreAuthService.getRefreshToken()).pipe(
    switchMap(success => {
      isRefreshing = false;

      if (success) {
        refreshSubject.next(true);
        return next(addToken(coreAuthService, req, headerService));
      }
      return throwError(() => new Error('Refresh failed'));
    }),
    catchError(err => {
      isRefreshing = false;
      coreAuthService.logout();
      router.navigate(['/login']);
      return throwError(() => err);
    })
  );
}

const addToken = (coreAuthService: CoreAuthService, request: HttpRequest<unknown>, headerService: HeaderService): HttpRequest<unknown> => {
  const accessToken = coreAuthService.getAccessToken();
  const headers = headerService.getHeaders();
  return accessToken ? request.clone({ setHeaders: headers.headers }) : request;
}