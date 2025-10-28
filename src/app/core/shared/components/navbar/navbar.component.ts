import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthStateService } from '../../services/auth-state.service';
import { LogoutUserUseCase } from '../../../features/user/aplication/use-cases/logout.usecase';
import { RolEnum } from '../../../features/user/domain/entities/rol.interface';

@Component({
  selector: 'navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
   private readonly authState = inject(AuthStateService);
  private readonly logoutUseCase = inject(LogoutUserUseCase);
  private readonly router = inject(Router);

  // Exponer signal a la plantilla
  protected readonly isAuthenticated = this.authState.isAuthenticated;

  async ngOnInit() {
    await this.authState.initFromStorage();
    try { console.log('[Navbar] authState isAuthenticated=', this.authState.isAuthenticated(), 'user=', this.authState.getUser()); } catch {}
  }

  async onLogout() {
    await this.logoutUseCase.execute();
    this.authState.clear();
    await this.router.navigate(['/'], { replaceUrl: true });
  }

  protected isExpert(): boolean {
    const user = this.authState.getUser();
    return !!user && user.rol.name === RolEnum.EXPERT;
  }

  protected isAdmin(): boolean {
    const user = this.authState.getUser();
    return !!user && user.rol.name === RolEnum.ADMIN;
  }
  
}
