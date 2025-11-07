import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SESSION_REPOSITORY } from '../../../domain/repositories/token-sesion';
import { USER_REPOSITORY } from '../../../domain/repositories/token';
import { SessionRepository } from '../../../domain/repositories/sesion.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.interface';
import { RolEnum } from '../../../domain/entities/rol.interface';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl:'mi-perfil.html',
  styleUrls: ['mi-perfil.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiPerfil implements OnInit {
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

  async ngOnInit(): Promise<void> {
    try {
      const session = await this.sessionRepo.getActive();
      if (!session) return;
      const current = await this.userRepo.getUserById(session.userId);
      this.user = current;
      this.cdr.markForCheck();
    } catch (err) {
      console.error('Error cargando perfil:', err);
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
