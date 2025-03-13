import { mergeApplicationConfig, ApplicationConfig, REQUEST } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { SERVER_REQUEST } from 'server.token';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    {
      provide: SERVER_REQUEST,
      useFactory: (req: any) => req,
      deps: [REQUEST]
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
