import { Injectable, signal, inject } from '@angular/core';
import { User } from '../../features/user/domain/entities/user.interface';
import { USER_REPOSITORY } from '../../features/user/domain/repositories/token';
import { UserRepository } from '../../features/user/domain/repositories/user.repository';
import { SESSION_REPOSITORY } from '../../features/user/domain/repositories/token-sesion';
import { SessionRepository } from '../../features/user/domain/repositories/sesion.repository';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly userRepo = inject(USER_REPOSITORY) as UserRepository;
  private readonly sessionRepo = inject(SESSION_REPOSITORY) as SessionRepository;

  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<User | null>(null);

  getUser(): User | null {
    return this.currentUser();
    
  }

  /**
   * Verifica si el rol en el JWT coincide con el rol en la base de datos.
   * Si no coinciden, cierra sesión para forzar un nuevo login.
   */
  private async validateTokenRoleSync(user: User): Promise<boolean> {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return true; // En SSR no validamos
    }

    try {
      const raw = localStorage.getItem('active_session');
      if (!raw) return false;
      
      const session = JSON.parse(raw) as { token?: string };
      if (!session.token) return false;

      // Decodificar el JWT para obtener el rol
      const payload = JSON.parse(atob(session.token.split('.')[1]));
      const tokenRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
      
      // Comparar con el rol del usuario de la BD
      const dbRole = user.rol.name;
      
      console.log('[AuthStateService] 🔍 Validando sincronización de roles:');
      console.log('  - Rol en JWT:', tokenRole);
      console.log('  - Rol en BD:', dbRole);

      // Si no coinciden, cerrar sesión
      if (tokenRole?.toLowerCase() !== dbRole?.toLowerCase()) {
        console.warn('[AuthStateService] ⚠️ Roles desincronizados. Cerrando sesión...');
        await this.forceLogout('Tu rol ha cambiado. Por favor, inicia sesión nuevamente.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[AuthStateService] ❌ Error validando roles:', error);
      return true; // En caso de error, no forzamos logout
    }
  }

  /**
   * Fuerza el cierre de sesión y muestra un mensaje
   */
  private async forceLogout(message: string): Promise<void> {
    await this.sessionRepo.end();
    this.clear();
    
    // Mostrar mensaje al usuario
    if (typeof window !== 'undefined') {
      alert(message);
      window.location.href = '/login';
    }
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
      const session = raw ? JSON.parse(raw) as { userId: string, token?: string } : null;
      
      if (session?.userId) {
        // Cargar usuario completo desde el repositorio
        const user = await this.userRepo.getUserById(session.userId);
        if (user) {
          // Validar que el rol del token coincida con el de la BD
          const isValid = await this.validateTokenRoleSync(user);
          
          if (isValid) {
            this.isAuthenticated.set(true);
            this.currentUser.set(user);
          }
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
          const session = JSON.parse(raw) as { userId: string, token?: string };
          const user = await this.userRepo.getUserById(session.userId);
          
          if (user) {
            // Validar roles también en sincronización entre pestañas
            const isValid = await this.validateTokenRoleSync(user);
            if (isValid) {
              this.isAuthenticated.set(true);
              this.currentUser.set(user);
            }
          } else {
            this.isAuthenticated.set(false);
            this.currentUser.set(null);
          }
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