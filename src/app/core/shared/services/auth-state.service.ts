import { Injectable, signal } from '@angular/core';
import { User } from '../../features/user/domain/entities/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<User | null>(null);

  getUser(): User | null {
    return this.currentUser();
    
  }

  initFromStorage(): void {
    // Evitar acceso en SSR (no existe window/localStorage)
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
      return;
    }

    try {
      const raw = localStorage.getItem('active_session');
      const session = raw ? JSON.parse(raw) as { userId: string } : null;
      this.isAuthenticated.set(!!session);
      // currentUser podría hidratarse con UserRepository.getById si existiera
    } catch {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
    }

    // Solo en navegador: sincronizar entre pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === 'active_session') {
        const raw = localStorage.getItem('active_session');
        this.isAuthenticated.set(!!raw);
        if (!raw) this.currentUser.set(null);
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