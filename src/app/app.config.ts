import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { USER_REPOSITORY } from './core/features/user/domain/repositories/token';
import { UserRepositoryMock } from './core/features/user/infrastructure/repositories/user.repository.mock';
import { RegisterUserUseCase } from './core/features/user/aplication/use-cases/register-user.usecase';

// Toggle here: true => use in-memory mock, false => use HTTP repository
const USE_MOCK_REPO = true;

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
     { provide: USER_REPOSITORY, useClass: UserRepositoryMock },
    RegisterUserUseCase
  ]
};
