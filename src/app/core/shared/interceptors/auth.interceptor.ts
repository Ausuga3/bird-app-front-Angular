import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo en el navegador (no en SSR)
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return next(req);
  }

  try {
    const raw = localStorage.getItem('active_session');
    if (!raw) {
      return next(req);
    }

    const session = JSON.parse(raw) as { userId: string; token?: string };
    
    if (session && session.token) {
      // Decodificar el token JWT para ver el rol (solo para debug)
      try {
        const payload = JSON.parse(atob(session.token.split('.')[1]));
        console.log('[AuthInterceptor] 🔑 Token JWT - Role:', payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role);
      } catch {}
      
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${session.token}`
        }
      });
      return next(cloned);
    }
  } catch (error) {
    console.error('[AuthInterceptor] ❌ Error obteniendo sesión:', error);
  }

  return next(req);
};
