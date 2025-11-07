import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ViewSightingUseCase } from '../../../aplication/use-cases/view-sighting.use-case';
import { DeleteSightingUseCase } from '../../../aplication/use-cases/delete-sighting.use-case';
import { AuthStateService } from '../../../../../shared/services/auth-state.service';
import { viewSightingDto } from '../../../aplication/dto/sighting.dto';

@Component({
  standalone: true,
  selector: 'app-sighting-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './sighting-details.html',
  styleUrl: './sighting-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SightingDetails {
  private readonly viewUseCase = inject(ViewSightingUseCase);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthStateService);

  sighting = signal<viewSightingDto | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {}

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) throw new Error('id required');

  const dto = await this.viewUseCase.execute(id);
  this.sighting.set(dto);
    } catch (err: any) {
      this.error.set(err?.message || 'Error cargando detalle');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  }

  canSeeActions(): boolean {
    const user = this.auth.getUser();
    if (!user) return false;
    const isAdmin = user?.rol?.name === 'admin';
    if (isAdmin) return true;
    const s = this.sighting();
    return !!(s && s.userId === user.id);
  }

  
}
