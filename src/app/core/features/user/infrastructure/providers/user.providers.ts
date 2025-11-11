import { Provider } from '@angular/core';
import { USER_REPOSITORY } from '../../domain/repositories/token';
import { UserRepositoryMock } from '../repositories/user.repository.mock';
import { UserHttpRepository } from '../repositories/user.repository.http';
import { SESSION_REPOSITORY} from '../../domain/repositories/token-sesion'
import { SessionRepositoryLocal } from '../repositories/session.repository-local';
export const AUTH_PROVIDERS: Provider[] = [
  {
    provide: USER_REPOSITORY,
    //useClass: UserRepositoryMock
    useClass: UserHttpRepository
  },
  {
    provide: SESSION_REPOSITORY,
     useClass: SessionRepositoryLocal
  }
];

// Si quieres usar el backend HTTP en lugar del mock, reemplaza la entrada
// anterior por la siguiente o coméntala/descoméntala según convenga.
// Nota: Ajusta los endpoints en `user.repository.http.ts` si tu backend tiene rutas distintas.
/*
export const AUTH_PROVIDERS: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserHttpRepository
  },
  {
    provide: SESSION_REPOSITORY,
    useClass: SessionRepositoryLocal
  }
];
*/