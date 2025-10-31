import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Sighting } from '../../../domain/entities/sighting.interface';
import { GetSightingsUseCase } from '../../../aplication/use-cases/list-sighting.use-case';
import { BirdRepository } from '../../../../bird/domain/repositories/bird.repository';
import { Bird } from '../../../../bird/domain/entities/bird.interface';

interface SightingWithBirdName extends Sighting {
  birdName: string;
}

@Component({
  selector: 'app-list-sighting',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: 'list-sigthing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListSighting implements OnInit { 
  private getSightingUseCase = inject(GetSightingsUseCase);
  private birdRepo = inject(BirdRepository);
  
  // Signals para estado reactivo (Angular 20)
  sightings = signal<SightingWithBirdName[]>([]);
  filteredSightings = signal<SightingWithBirdName[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Formulario reactivo para filtros
  searchControl = new FormControl('');
  
  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      
      // Cargar avistamientos y aves en paralelo
      const [sightingsData, birds] = await Promise.all([
        this.getSightingUseCase.execute(),
        this.birdRepo.getAllBirds()
      ]);
      
      // Crear un mapa para buscar nombres de aves por ID
      const birdMap = new Map<string, Bird>();
      birds.forEach(bird => birdMap.set(bird.id, bird));
      
      // Enriquecer datos de avistamientos con nombres de aves
      const sightingsWithNames = sightingsData.map(sighting => ({
        ...sighting,
        birdName: sighting.bird?.commonName || birdMap.get(sighting.bird?.id || '')?.commonName || 'Ave desconocida'
      }));
      
      // Ordenar por fecha más reciente
      sightingsWithNames.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.updated_at).getTime()
      );
      
      this.sightings.set(sightingsWithNames);
      this.filteredSightings.set(sightingsWithNames);
      
      // Configurar filtro de búsqueda
      this.searchControl.valueChanges.subscribe(searchTerm => {
        this.filterSightings(searchTerm || '');
      });
      
    } catch (err: any) {
      this.error.set(err?.message || 'Error al cargar los avistamientos');
      console.error('Error cargando avistamientos:', err);
    } finally {
      this.loading.set(false);
    }
  }
  
  filterSightings(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredSightings.set(this.sightings());
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = this.sightings().filter(s => 
      s.birdName.toLowerCase().includes(term) || 
      s.country.toLowerCase().includes(term) ||
      s.notes?.toLowerCase().includes(term)
    );
    
    this.filteredSightings.set(filtered);
  }
  
  formatDate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  }
  
  async deleteSighting(id: string): Promise<void> {
    try {
      const updated = this.sightings().filter(s => s.id !== id);
      this.sightings.set(updated);
      this.filteredSightings.set(
        this.filteredSightings().filter(s => s.id !== id)
      );
    } catch (err: any) {
      console.error('Error eliminando avistamiento:', err);
    }
  }
}