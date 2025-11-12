import { Provider } from '@angular/core';
import { BirdRepository } from '../../domain/repositories/bird.repository';
import { BirdHttpRepository } from '../repositories/bird-http.repository';
import { SightingRepository } from '../../../sighting/domain/repositories/sighting.repository';
import { SightingLocalRepository } from '../../../sighting/infrastructure/repositories/sighting-local.repository';

export const birdProviders: Provider[] = [
  { provide: BirdRepository, useClass: BirdHttpRepository },
  { provide: SightingRepository, useClass: SightingLocalRepository }
];