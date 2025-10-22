import { Injectable } from "@angular/core";
import { SightingRepository } from "../../domain/repositories/sighiting.repository";
import { BirdRepository } from "../../domain/repositories/bird.repository";
import { CreateSightingDto } from "../dto/sighting.dto";
import { Sighting } from "../../domain/entities/sighting.interface";


@Injectable({ providedIn: 'root' })
export class AddSightingUseCase {
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

    // Build Sighting entity (embed bird fully)
    const sighting: Sighting = {
      id: '', // repo will set id
      coordinates: dto.coordinates,
      country: dto.country,
      bird,
      created_at: new Date(dto.date),
      updated_at: new Date(dto.date),
      notes: dto.notes
    };

    return this.sightRepo.addSighting(sighting);
  }
}