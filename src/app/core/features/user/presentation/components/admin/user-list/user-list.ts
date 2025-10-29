import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GetUsersUseCase } from '../../../../aplication/use-cases/getUsers.usecase';
import { ChangeRolUseCase } from '../../../../aplication/use-cases/change-rol.usecase';
import { AuthStateService } from '../../../../../../shared/services/auth-state.service';
import { User } from '../../../../domain/entities/user.interface';
import { RolEnum } from '../../../../domain/entities/rol.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {
  private readonly getUsersUseCase = inject(GetUsersUseCase);
  private readonly authState = inject(AuthStateService);
  private readonly changeRolUseCase = inject(ChangeRolUseCase);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  // ids de usuarios que solicitaron cambio a experto
  requestedExpertIds = signal<string[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // simple search control (name or email)
  searchControl = new FormControl('');

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      await Promise.all([this.loadUsers(), this.loadRequests()]);

      this.searchControl.valueChanges.subscribe(value => {
        this.filterUsers(value || '');
      });
    } catch (err: any) {
      this.error.set(err?.message || 'Error cargando usuarios');
    } finally {
      this.loading.set(false);
    }
  }

  protected async loadUsers(): Promise<void> {
    const actor = this.authState.getUser() as User | null;
    const dto = {
      userId: actor?.id ?? '',
      name: '',
      email: '',
      rolName: undefined,
    } as any;

    const all = await this.getUsersUseCase.execute(dto);
    // ordenar por nombre
    all.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    this.users.set(all);
    this.filteredUsers.set(all);
  }

  // Cargar solicitudes desde localStorage (clave usada en MiPerfil)
  protected async loadRequests(): Promise<void> {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        this.requestedExpertIds.set([]);
        return;
      }
      const raw = localStorage.getItem('role_change_requests');
      if (!raw) {
        this.requestedExpertIds.set([]);
        return;
      }
      const requests = JSON.parse(raw) as Array<{ userId: string; requestedRole: string }>;
      const ids = requests
        .filter(r => r.requestedRole === RolEnum.EXPERT)
        .map(r => r.userId);
      this.requestedExpertIds.set(ids);
    } catch (err) {
      console.error('Error leyendo solicitudes de localStorage', err);
      this.requestedExpertIds.set([]);
    }
  }

  private filterUsers(term: string): void {
    const q = term.toLowerCase().trim();
    if (!q) {
      this.filteredUsers.set(this.users());
      return;
    }

    const filtered = this.users().filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );

    this.filteredUsers.set(filtered);
  }

  protected isAdmin(): boolean {
    const user = this.authState.getUser() as User | null;
    return !!user && user.rol.name === RolEnum.ADMIN;
  }

  protected async toggleActive(target: User): Promise<void> {
    const actor = this.authState.getUser() as User | null;
    if (!actor) {
      this.error.set('Debes iniciar sesión para realizar esta acción');
      return;
    }

    try {
      this.loading.set(true);
      const updated = await this.getUsersUseCase.toggleActive(actor.id, target.id, !target.isActive);

      // actualizar lista local sin recargar todo
      const users = this.users().map(u => (u.id === updated.id ? updated : u));
      this.users.set(users);
      this.filterUsers(this.searchControl.value || '');
    } catch (err: any) {
      this.error.set(err?.message || 'Error actualizando usuario');
    } finally {
      this.loading.set(false);
    }
  }

  protected async approveExpert(target: User): Promise<void> {
    const actor = this.authState.getUser() as User | null;
    if (!actor) {
      this.error.set('Debes iniciar sesión para realizar esta acción');
      return;
    }

    try {
      this.loading.set(true);
      const updated = await this.changeRolUseCase.execute({
        actorId: actor.id,
        targetUserId: target.id,
        newRol: RolEnum.EXPERT,
      } as any);

      // actualizar lista local
      const users = this.users().map(u => (u.id === updated.id ? updated : u));
      this.users.set(users);
      this.filterUsers(this.searchControl.value || '');

      // eliminar la solicitud del localStorage
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('role_change_requests');
        if (raw) {
          const requests = JSON.parse(raw) as Array<any>;
          const filtered = requests.filter(r => r.userId !== target.id);
          localStorage.setItem('role_change_requests', JSON.stringify(filtered));
        }
      }

      // recargar solicitudes locales
      await this.loadRequests();
    } catch (err: any) {
      this.error.set(err?.message || 'Error cambiando rol');
    } finally {
      this.loading.set(false);
    }
  }

  protected formatRole(r: any): string {
    return r?.name || '-';
  }
}
