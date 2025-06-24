import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideApollo } from 'apollo-angular';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ApolloConfigService } from '@core/services/apollo-config.service';
import { authInterceptor } from '@core/interceptor/auth.interceptor';
import { environment } from 'env/env';
import { EnvironmentToken } from './env.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    { provide: EnvironmentToken, useValue: environment },
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideAnimationsAsync(),
    provideApollo(ApolloConfigService.setApolloConfig),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p', darkModeSelector: '.my-app-dark',
        }
      },
      ripple: true
    })
  ]
};
