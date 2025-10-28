import { Provider } from '@angular/core';
import { BirdRepository } from '../../domain/repositories/bird.repository';
import { BirdLocalRepository } from '../repositories/bird-local.repository';
import { SightingRepository } from '../../../sighting/domain/repositories/sighting.repository';
import { SightingLocalRepository } from '../../../sighting/infrastructure/repositories/sighting-local.repository';

// import { BirdHttpRepository } from '../repositories/bird-http.repository';

export const birdProviders: Provider[] = [
  { provide: BirdRepository, useClass: BirdLocalRepository },
  { provide: SightingRepository, useClass: SightingLocalRepository }

  
  // para usar HTTP, reemplaza por:
  // { provide: BirdRepository, useClass: BirdHttpRepository }
];