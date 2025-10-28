import { Sighting } from '../entities/sighting.interface';

export abstract class SightingRepository {
  abstract addSighting(sighting: Sighting): Promise<Sighting>;
  abstract getAllSightings(): Promise<Sighting[]>;
  abstract getSightingById(id: string): Promise<Sighting | null>;
  abstract deleteSighting(id: string): Promise<void>;
  abstract getSightingByBirdId(birdId: string): Promise<Sighting[]>;
}