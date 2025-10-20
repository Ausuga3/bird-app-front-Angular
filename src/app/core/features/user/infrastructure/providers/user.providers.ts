import { Provider } from '@angular/core';
import { USER_REPOSITORY } from '../../domain/repositories/token';
import { UserRepositoryMock } from '../repositories/user.repository.mock';
import { SESSION_REPOSITORY} from '../../domain/repositories/token-sesion'
import { SessionRepositoryLocal } from '../repositories/session.repository-local';
export const AUTH_PROVIDERS: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepositoryMock
  },
  {
    provide: SESSION_REPOSITORY,
     useClass: SessionRepositoryLocal
  }
];