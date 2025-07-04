import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { Router } from '@angular/router';
import { CoreAuthService } from '@core/services/core-auth.service';
import { HeaderService } from '@core/services/header.service';
import { BehaviorSubject, catchError, from, switchMap, tap, throwError } from 'rxjs';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

let isRefreshing = false;

const refreshSubject = new BehaviorSubject<boolean>(false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    const serverReq = inject(REQUEST);
    const cookie = serverReq?.headers.get('cookie');
    console.log({ cookie });

    if (serverReq && cookie) {
      req = req.clone({ setHeaders: { Cookie: cookie }, withCredentials: true });
    }
    return next(req);
  }
  if (isPlatformBrowser(platformId)) {
    console.log('req from auto interceptor', req.headers);

  }

  const coreAuthService = inject(CoreAuthService);

  const headerService = inject(HeaderService);

  const router = inject(Router);

  const authReq = addToken(coreAuthService, req, headerService);

  return next(authReq).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.log('event.headers ', event.headers);

        const token = event.headers.get('Set-Cookie');
        if (token) {
          document.cookie = token;
        }
      }
    }),
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
      router.navigate(['/signin']);
      return throwError(() => err);
    })
  );
}

const addToken = (coreAuthService: CoreAuthService, request: HttpRequest<unknown>, headerService: HeaderService): HttpRequest<unknown> => {
  const accessToken = coreAuthService.getAccessToken();
  const headers = headerService.getHeaders();
  return accessToken ? request.clone({ setHeaders: headers.headers }) : request;
}