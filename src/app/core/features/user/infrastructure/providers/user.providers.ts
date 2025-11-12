import { Provider } from '@angular/core';
import { USER_REPOSITORY } from '../../domain/repositories/token';
import { UserRepositoryHttp } from '../repositories/user.repository-http';
import { SESSION_REPOSITORY} from '../../domain/repositories/token-sesion'
import { SessionRepositoryLocal } from '../repositories/session.repository-local';

export const AUTH_PROVIDERS: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepositoryHttp
  },
  {
    provide: SESSION_REPOSITORY,
     useClass: SessionRepositoryLocal
  }
];