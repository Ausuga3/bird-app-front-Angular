import { InjectionToken } from '@angular/core';
import { SessionRepository } from './sesion.repository';


export const SESSION_REPOSITORY = new InjectionToken<SessionRepository>('SESSION_REPOSITORY');