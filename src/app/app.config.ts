import { ApplicationConfig } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideApollo } from 'apollo-angular';
import { providePrimeNG } from 'primeng/config';
import { ApolloConfigService } from '@core/services/apollo-config.service';
import { authInterceptor } from '@core/interceptor/auth.interceptor';
import { environment } from 'environment/environment';
import { EnvironmentToken, MY_APOLLO_CACHE } from './env.token';
import { primeNgPreset } from '@core/config/primeng-preset';
import { CustomTitleStrategy } from '@core/config/custom-title-strategy';
import { InMemoryCache } from '@apollo/client/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    { provide: MY_APOLLO_CACHE, useValue: new InMemoryCache() },
    { provide: EnvironmentToken, useValue: environment },
    { provide: TitleStrategy, useClass: CustomTitleStrategy },
    provideClientHydration(),
    // provideClientHydration(withHttpTransferCacheOptions({
    //   includePostRequests: true,
    //   includeHeaders: ['Set-Cookie']
    // })),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideAnimationsAsync(),
    provideApollo(ApolloConfigService.setApolloConfig),
    providePrimeNG(primeNgPreset)
  ]
};
