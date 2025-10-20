import { Injectable } from '@angular/core';
import { Bird, BirdFamily, ConservationStatusEnum } from '../../domain/entities/bird.interface';
import { BirdRepository } from '../../domain/repositories/bird.repository';
import { AuthStateService } from '../../../../shared/services/auth-state.service';
import { AddBirdDto } from '../dto/bird.dto';
import { RolEnum } from '../../../user/domain/entities/rol.interface';

@Injectable({
  providedIn: 'root'
})
export class AddBirdUseCase {
  constructor(
    private readonly birdRepository: BirdRepository,
    private readonly authState: AuthStateService
  ) {}

  async execute(dto: AddBirdDto): Promise<Bird> {
    // 1. Verificar autorización
    const currentUser = await this.authState.getUser();
    // if (!currentUser || currentUser.rol.name !== RolEnum.EXPERT) {
    //   throw new Error('Solo usuarios EXPERT pueden agregar aves');
    // }

    // 2. Validar datos
    this.validateBirdDto(dto);

    // 3. Crear entidad Bird
    const now = new Date();
    const bird: Bird = {
      id: crypto.randomUUID(), // Generamos UUID único
      commonName: dto.commonName,
      scientificName: dto.scientificName,
      family: dto.family,
      notes: dto.notes,
      conservationStatus: dto.conservationStatus,
      created_at: now,
      updated_at: now
    };

    // 4. Persistir y retornar
    return this.birdRepository.addBird(bird);
  }

  private validateBirdDto(dto: AddBirdDto): void {
    if (!dto.commonName?.trim()) {
      throw new Error('El nombre común es requerido');
    }
    if (!dto.scientificName?.trim()) {
      throw new Error('El nombre científico es requerido');
    }
    if (!Object.values(BirdFamily).includes(dto.family)) {
      throw new Error('Familia de ave inválida');
    }
    if (!Object.values(ConservationStatusEnum).includes(dto.conservationStatus)) {
      throw new Error('Estado de conservación inválido');
    }
  }
}