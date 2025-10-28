import { inject, Injectable } from "@angular/core";
import { SightingRepository } from "../../domain/repositories/sighting.repository";
import { Sighting } from "../../domain/entities/sighting.interface";

@Injectable({ providedIn: 'root' })
export class GetSightingsUseCase {
  private repo = inject(SightingRepository);

  async execute(birdId?: string): Promise<Sighting[]> {
    if (birdId) {
      return this.repo.getSightingByBirdId(birdId);
    }
    return this.repo.getAllSightings();
  }
}