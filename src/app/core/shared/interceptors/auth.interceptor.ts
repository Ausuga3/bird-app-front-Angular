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
      console.log('[AuthInterceptor] 🔑 Agregando token a la petición');
      
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
