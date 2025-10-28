import { Provider } from '@angular/core';
import { SightingRepository } from '../../domain/repositories/sighting.repository';
import { SightingLocalRepository } from '../repositories/sighting-local.repository';
import { GetSightingsUseCase } from '../../aplication/use-cases/list-sighting.use-case';

export const sightingProviders: Provider[] = [
  { provide: SightingRepository, useClass: SightingLocalRepository },
  GetSightingsUseCase
];