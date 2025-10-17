import { Provider } from '@angular/core';
import { USER_REPOSITORY } from '../../domain/repositories/token';
import { UserRepositoryMock } from '../repositories/user.repository.mock';

export const AUTH_PROVIDERS: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserRepositoryMock
  }
];