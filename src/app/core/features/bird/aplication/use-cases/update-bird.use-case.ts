// ...existing code...

import { Injectable } from '@angular/core';
import { Bird } from "../../domain/entities/bird.interface";
import { BirdRepository } from "../../domain/repositories/bird.repository";
import { AuthStateService } from '../../../../shared/services/auth-state.service';
import { UpdateBirdDto } from "../dto/bird.dto";

@Injectable({
  providedIn: 'root'
})
export class UpdateBirdUseCase {
  constructor(
    private readonly birdRepository: BirdRepository,
    private readonly authState: AuthStateService
  ) {}

  async execute(id: string, dto: UpdateBirdDto): Promise<Bird> {
    const existing = await this.birdRepository.getBirdById(id);
    if (!existing) {
      throw new Error('Ave no encontrada');
    }

    // Validación de permisos: solo admin o el creador pueden editar
    const currentUser = await this.authState.getUser();
    const isAdmin = currentUser?.rol?.name === 'admin';
    if (!isAdmin && existing.created_by !== currentUser?.id) {
      throw new Error('No autorizado para editar esta ave');
    }

    // Sólo sobrescribir las propiedades que vienen definidas en el DTO
    const allowedKeys = Object.keys(dto) as (keyof UpdateBirdDto)[];
    for (const key of allowedKeys) {
      // @ts-expect-error asignación dinámica intencional — ajustar si la entidad usa setters
      if (dto[key] !== undefined) existing[key as keyof Bird] = dto[key] as any;
    }

    const updated = await this.birdRepository.editBird(id, existing);
    return updated;
  }
}
