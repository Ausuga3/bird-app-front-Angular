import { Provider } from '@angular/core';
import { SightingRepository } from '../../domain/repositories/sighiting.repository';
import { GetSightingsUseCase } from '../../aplication/use-cases/list-sighting.use-case';
import { SightingLocalRepository } from '../repositories/sighting-local.repository';

export const sightingProviders: Provider[] = [
  { provide: SightingRepository, useClass: SightingLocalRepository },
  GetSightingsUseCase
];