import { Injectable } from '@angular/core';
import { Session } from '../../domain/entities/sesion.interface';
import { SessionRepository } from '../../domain/repositories/sesion.repository';


@Injectable({ providedIn: 'root' })
export class SessionRepositoryLocal implements SessionRepository {
  private readonly key = 'active_session';

  async getActive(): Promise<Session | null> {
    const raw = localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as Session) : null;
    // Nota: en SSR, localStorage no existe; usar solo en navegador.
  }

  async start(userId: string): Promise<void> {
    const session: Session = { userId, startedAt: new Date().toISOString() };
    localStorage.setItem(this.key, JSON.stringify(session));
    try {
      console.log('[SessionRepositoryLocal] start(): session saved', session);
    } catch {}
  }

  async end(): Promise<void> {
    localStorage.removeItem(this.key);
  }
}