import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

injectSpeedInsights();
inject();