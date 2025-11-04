import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Bird } from '../../../../domain/entities/bird.interface';
import { ListBirdUseCase } from '../../../../aplication/use-cases/list-bird.use-case';
import { AuthStateService } from '../../../../../../shared/services/auth-state.service';
import { DeletedBirdUseCase } from '../../../../aplication/use-cases/deleted-bird.use-case';

@Component({
  selector: 'app-table-bird',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './table-bird.component.html',
  // providers removed: repository providers are registered globally in app providers
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBirdComponent implements OnInit {
  private authState = inject(AuthStateService);
  private deletedBird = inject(DeletedBirdUseCase);
  private listBird = inject(ListBirdUseCase);

  protected birds = signal<Bird[]>([]);
  protected isLoading = signal<boolean>(true);
  protected error = signal<string | null>(null);
  protected filteredBirds = signal<Bird[]>([]);
  protected user = this.authState.getUser();
  
  constructor(
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadBirds();
  }

  filterBirds(searchTerm:string):void{
    if (!searchTerm.trim()) {
      this.filteredBirds.set(this.birds());
      return;
    }
    const term = searchTerm.toLowerCase().trim();
    const filtered = this.birds().filter(bird =>
      bird.commonName.toLowerCase().includes(term) ||
      bird.scientificName.toLowerCase().includes(term) ||
      bird.family.toLowerCase().includes(term)
    );
    this.filteredBirds.set(filtered);
  }
  
  async loadBirds(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const data = await this.listBird.execute();
      this.birds.set(data);
      // Inicializar lista filtrada
      this.filteredBirds.set(data);
    } catch (err: any) {
      this.error.set(err.message || 'Error al cargar la lista de aves');
      console.error('Error loading birds:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteBird(id: string): Promise<void> {
    if (!confirm('¿Deseas eliminar este avistamiento?')) return;

    try {
      this.isLoading.set(true);
      await this.deletedBird.execute(id);
      const updated = this.birds().filter(bird => bird.id !== id);
      this.birds.set(updated);
      this.filteredBirds.set(
        this.filteredBirds().filter(bird => bird.id !== id)
      )

    } catch (err: any) {
      const msg = err?.message || 'Error al eliminar el ave';
      this.error.set(msg);
      console.error('Error Eliminando Ave', err);
    } finally{
      this.isLoading.set(false);
    }
  }

  canSeeAnyActions(): boolean {
    if (!this.user) return false;
    const isAdmin = this.user?.rol?.name === 'admin';
    if (isAdmin) return true;
    return this.birds().some(s => s.created_by === this.user?.id);
  }

  canSeeActions(bird?:Bird): boolean {
    if (!this.user) return false;
    const isAdmin = this.user?.rol?.name === 'admin';
    if (isAdmin) return true;
    if (!bird) return false;
    return bird.created_by === this.user?.id;
  }

  canCreatedBirds(): boolean {
    if (!this.user) return false;
    return this.user.rol?.name === 'expert' || this.user.rol?.name === 'admin';
  }
  
}
