import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Bird } from '../../../../domain/entities/bird.interface';
import { BirdRepository } from '../../../../domain/repositories/bird.repository';
import { BirdLocalRepository } from '../../../../infrastructure/repositories/bird-local.repository';
import { RolEnum } from '../../../../../user/domain/entities/rol.interface';
import { AuthStateService } from '../../../../../../shared/services/auth-state.service';

@Component({
  selector: 'app-table-bird',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-bird.component.html',
  styleUrl: './table-bird.component.css',
  providers: [
    { provide: BirdRepository, useClass: BirdLocalRepository }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBirdComponent implements OnInit {
private authState = inject(AuthStateService);
//metodo para verificar si el usuario es admin

 protected canEditOrDelete(): boolean {
    const user = this.authState.getUser();
    return user?.rol.name === RolEnum.USER || !user ? false : true;
 }
   
  protected birds = signal<Bird[]>([]);
  protected isLoading = signal<boolean>(true);
  protected error = signal<string | null>(null);
  
  constructor(
    private birdRepository: BirdRepository,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadBirds();
  }
  
  async loadBirds(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const data = await this.birdRepository.getAllBirds();
      this.birds.set(data);
    } catch (err: any) {
      this.error.set(err.message || 'Error al cargar la lista de aves');
      console.error('Error loading birds:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteBird(id: string): Promise<void> {
    if (!confirm('¿Estás seguro de eliminar esta ave?')) {
      return;
    }
    
    try {
      await this.birdRepository.deleteBird(id);
      // Recargar la lista después de eliminar
      await this.loadBirds();
    } catch (err: any) {
      this.error.set(err.message || 'Error al eliminar el ave');
      console.error('Error deleting bird:', err);
    }
  }
  
  editBird(id: string): void {
    this.router.navigate(['/birds/edit', id]);
  }
  
  goToAddBird(): void {
    this.router.navigate(['/birds/add']);
  }
}
