import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { USER_REPOSITORY } from './core/features/user/domain/repositories/token';
import { SESSION_REPOSITORY } from './core/features/user/domain/repositories/token-sesion';
import { UserRepositoryMock } from './core/features/user/infrastructure/repositories/user.repository.mock';
import { UserRepositoryHttp } from './core/features/user/infrastructure/repositories/user.repository-http';
import { SessionRepositoryLocal } from './core/features/user/infrastructure/repositories/session.repository-local';
import { RegisterUserUseCase } from './core/features/user/aplication/use-cases/register-user.usecase';
import { birdProviders } from './core/features/bird/infrastructure/providers/bird.providers';
import { authInterceptor } from './core/shared/interceptors/auth.interceptor';

// Toggle here: true => use in-memory mock, false => use HTTP repository
const USE_MOCK_REPO = false;

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    { provide: USER_REPOSITORY, useClass: USE_MOCK_REPO ? UserRepositoryMock : UserRepositoryHttp },
    { provide: SESSION_REPOSITORY, useClass: SessionRepositoryLocal },
    RegisterUserUseCase,
    ...birdProviders  // Añadimos los providers de bird
  ]
};
