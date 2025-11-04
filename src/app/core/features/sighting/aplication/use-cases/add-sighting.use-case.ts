import { Injectable, inject } from "@angular/core";
import { SightingRepository } from "../../domain/repositories/sighting.repository";
import { BirdRepository } from "../../../bird/domain/repositories/bird.repository";
import { CreateSightingDto } from "../dto/sighting.dto";
import { Sighting } from "../../domain/entities/sighting.interface";
import { AuthStateService } from '../../../../shared/services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class AddSightingUseCase {
  private readonly auth = inject(AuthStateService);
  constructor(
    private readonly sightRepo: SightingRepository,
    private readonly birdRepo: BirdRepository
  ) {}

  async execute(dto: CreateSightingDto): Promise<Sighting> {
    // validations
    if (!dto.birdId) throw new Error('birdId required');
    if (!dto.coordinates) throw new Error('coordinates required');
    // optionally validate bird exists
    const bird = await this.birdRepo.getBirdById(dto.birdId);
    if (!bird) throw new Error('Bird not found');

  const currentUser = this.auth.getUser();

    const sighting: Sighting = {
      id: '', 
      coordinates: dto.coordinates,
      country: dto.country,
      bird,
      created_by: currentUser?.id,
      created_at: new Date(dto.date),
      updated_at: new Date(dto.date),
      notes: dto.notes
    };

    return this.sightRepo.addSighting(sighting);
  }
}