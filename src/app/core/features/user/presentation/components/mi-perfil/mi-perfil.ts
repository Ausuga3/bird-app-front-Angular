import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, PLATFORM_ID, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SESSION_REPOSITORY } from '../../../domain/repositories/token-sesion';
import { USER_REPOSITORY } from '../../../domain/repositories/token';
import { SessionRepository } from '../../../domain/repositories/sesion.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.interface';
import { RolEnum } from '../../../domain/entities/rol.interface';
import { RouterLink } from "@angular/router";
import { AuthStateService } from '../../../../../shared/services/auth-state.service';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl:'mi-perfil.html',
  styleUrls: ['mi-perfil.css'],
  // Cambiar a Default para que detecte cambios en signals
  changeDetection: ChangeDetectionStrategy.Default,
})
export class MiPerfil implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly sessionRepo = inject(SESSION_REPOSITORY) as SessionRepository;
  private readonly userRepo = inject(USER_REPOSITORY) as UserRepository;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  requesting = false;
  requestMessage = '';
  desiredRole: RolEnum = RolEnum.EXPERT;

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    // Efecto que se ejecuta cuando cambia el usuario autenticado
    effect(() => {
      const currentUser = this.authState.currentUser();
      console.log('🔄 [MiPerfil] AuthState changed, user:', currentUser);
      this.user = currentUser;
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      // Primero intentar obtener del AuthState (ya está cargado si hay sesión)
      const currentUser = this.authState.getUser();
      if (currentUser) {
        console.log('✅ [MiPerfil] User from AuthState:', currentUser);
        this.user = currentUser;
        return;
      }

      // Fallback: cargar desde repositorio si no está en AuthState
      const session = await this.sessionRepo.getActive();
      if (!session) {
        console.log('⚠️ [MiPerfil] No active session found');
        return;
      }
      
      const user = await this.userRepo.getUserById(session.userId);
      console.log('✅ [MiPerfil] User loaded from repo:', user);
      this.user = user;
      
      // Actualizar AuthState para mantener consistencia
      if (user) {
        this.authState.setAuthenticated(user);
      }
    } catch (err) {
      console.error('❌ [MiPerfil] Error cargando perfil:', err);
    }
  }


  requestRoleChange(): void {
    if (!this.user || !this.isBrowser) return;
    this.requesting = true;
    try {
      const key = 'role_change_requests';
      const raw = localStorage.getItem(key);
      const requests = raw ? JSON.parse(raw) : [];
      const req = {
        id: crypto.randomUUID(),
        userId: this.user.id,
        currentRole: this.user.rol.name,
        requestedRole: this.desiredRole,
        requestedAt: new Date().toISOString(),
      };
      requests.push(req);
      localStorage.setItem(key, JSON.stringify(requests));
      this.requestMessage = 'Solicitud enviada. Un administrador la revisará.';
    } catch (err) {
      console.error('Error guardando solicitud:', err);
      this.requestMessage = 'Error al enviar la solicitud.';
    } finally {
      this.requesting = false;
    }
  }

  toggleDesiredRole(): void {
    this.desiredRole = this.desiredRole === RolEnum.EXPERT ? RolEnum.USER : RolEnum.EXPERT;
  }

  public isUser(): boolean {
    return this.user?.rol.name === RolEnum.USER;
  }
}
