import { Injectable, signal, inject } from '@angular/core';
import { User } from '../../features/user/domain/entities/user.interface';
import { USER_REPOSITORY } from '../../features/user/domain/repositories/token';
import { UserRepository } from '../../features/user/domain/repositories/user.repository';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly userRepo = inject(USER_REPOSITORY) as UserRepository;

  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<User | null>(null);

  getUser(): User | null {
    return this.currentUser();
    
  }

  async initFromStorage(): Promise<void> {
    // Evitar acceso en SSR (no existe window/localStorage)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
      return;
    }

    try {
      const raw = localStorage.getItem('active_session');
      const session = raw ? JSON.parse(raw) as { userId: string } : null;
      
      if (session?.userId) {
        // Cargar usuario completo desde el repositorio
        const user = await this.userRepo.getUserById(session.userId);
        if (user) {
          this.isAuthenticated.set(true);
          this.currentUser.set(user);
        } else {
          this.isAuthenticated.set(false);
          this.currentUser.set(null);
        }
      } else {
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
      }
    } catch {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
    }

    // Solo en navegador: sincronizar entre pestañas
    window.addEventListener('storage', async (e) => {
      if (e.key === 'active_session') {
        const raw = localStorage.getItem('active_session');
        if (raw) {
          const session = JSON.parse(raw) as { userId: string };
          const user = await this.userRepo.getUserById(session.userId);
          this.isAuthenticated.set(!!user);
          this.currentUser.set(user);
        } else {
          this.isAuthenticated.set(false);
          this.currentUser.set(null);
        }
      }
    });
  }

  setAuthenticated(user: User): void {
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  clear(): void {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }
}