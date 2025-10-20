import { Provider } from '@angular/core';
import { BirdRepository } from '../../domain/repositories/bird.repository';
import { BirdLocalRepository } from '../repositories/bird-local.repository';
// import { BirdHttpRepository } from '../repositories/bird-http.repository';

export const birdProviders: Provider[] = [
  { provide: BirdRepository, useClass: BirdLocalRepository }
  // para usar HTTP, reemplaza por:
  // { provide: BirdRepository, useClass: BirdHttpRepository }
];