import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AUTH_PROVIDERS } from './app/core/features/user/infrastructure/providers/user.providers';

bootstrapApplication(App, {
  ...appConfig,
  providers: [...(appConfig.providers || []), ...AUTH_PROVIDERS],
})
  .catch((err) => console.error(err));
