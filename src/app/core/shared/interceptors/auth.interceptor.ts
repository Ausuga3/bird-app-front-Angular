import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SESSION_REPOSITORY } from '../../features/user/domain/repositories/token-sesion';
import { SessionRepository } from '../../features/user/domain/repositories/sesion.repository';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private sessionRepo = inject(SESSION_REPOSITORY) as SessionRepository;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // getActive is async; convert to observable and attach token if present
    return from(this.sessionRepo.getActive()).pipe(
      mergeMap(session => {
        if (session?.token) {
          const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } });
          return next.handle(cloned);
        }
        return next.handle(req);
      })
    );
  }
}
