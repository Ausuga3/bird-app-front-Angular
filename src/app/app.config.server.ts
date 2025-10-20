import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { AUTH_PROVIDERS } from './core/features/user/infrastructure/providers/user.providers';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    ...AUTH_PROVIDERS
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
