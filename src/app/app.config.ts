import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { GraphqlClientService } from './shared/services/graphql-client.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { GraphqlConfigService } from './core/services/graphql-config.service';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimationsAsync(),
    {
      provide: APOLLO_OPTIONS,
      useFactory: (graphqlConfigService: GraphqlConfigService) => {
        // Environment is fully initialized before this runs
        // const graphqlUri = envService.getEnvironment().graphqlUri;
        return graphqlConfigService.createApollo();
      },
      deps: [GraphqlConfigService],
    },
    Apollo,
    GraphqlClientService,
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.my-app-dark',
          cssLayer: false
        }
      },
      ripple: true
    })
  ]
};
