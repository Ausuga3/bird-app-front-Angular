import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Session } from '../../domain/entities/sesion.interface';
import { SessionRepository } from '../../domain/repositories/sesion.repository';


@Injectable({ providedIn: 'root' })
export class SessionRepositoryLocal implements SessionRepository {
  private readonly key = 'active_session';
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async getActive(): Promise<Session | null> {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.key);
    return raw ? (JSON.parse(raw) as Session) : null;
  }

  async start(userId: string, token: string): Promise<void> {
    if (!this.isBrowser) return;
    const session: Session & { token: string } = { 
      userId, 
      startedAt: new Date().toISOString(),
      token 
    };
    localStorage.setItem(this.key, JSON.stringify(session));
    try {
      console.log('[SessionRepositoryLocal] start(): session saved with token', { userId, hasToken: !!token });
    } catch {}
  }

  async end(): Promise<void> {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.key);
  }
}