import { inject, Injectable } from '@angular/core';
import { SESSION_REPOSITORY } from '../../domain/repositories/token-sesion';

@Injectable({ providedIn: 'root' })
export class LogoutUserUseCase {
  private readonly sessionRepository = inject(SESSION_REPOSITORY);

  async execute(): Promise<void> {
    await this.sessionRepository.end();
  }
}