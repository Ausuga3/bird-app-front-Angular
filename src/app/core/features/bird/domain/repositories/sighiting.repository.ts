export abstract class SightingRepository {
  abstract addSighting(sighting: import('../entities/sighting.interface').Sighting): Promise<import('../entities/sighting.interface').Sighting>;
  abstract getAllSightings(): Promise<import('../entities/sighting.interface').Sighting[]>;
  abstract getSightingById(id: string): Promise<import('../entities/sighting.interface').Sighting | null>;
  abstract deleteSighting(id: string): Promise<void>;
  abstract getSightingByBirdId(birdId: string): Promise<import('../entities/sighting.interface').Sighting[]>;
}