import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../../domain/entities/user.interface';
import { UserRepository } from '../../domain/repositories/user.repository';
import { RolEnum } from '../../domain/entities/rol.interface';

@Injectable()
export class UserHttpRepository implements UserRepository {
  private http = inject(HttpClient);

  // TODO: Mover a environment cuando se configure
  // Usamos rutas separadas: `authUrl` para login/register y `baseUrl`
  // para operaciones sobre el recurso usuario (GET/PUT/DELETE).
  private authUrl = 'http://localhost:5291/api/Auth';
  private baseUrl = 'http://localhost:5291/api/Users';

  async register(user: User): Promise<User> {
    try {
      // El backend espera: { email, password, name, role: number (enum) }
      // Role enum: 0=Admin, 1=Experto, 2=Usuario (default Usuario)
      const anyUser = user as any;
      
      // Obtener password del objeto (viene del use case)
      const password = anyUser.password;
      
      if (!password) {
        console.error('❌ Password is missing! User object:', anyUser);
        throw new Error('Password missing in register payload');
      }
      
      // Mapear nombre de rol a valor enum
      let roleValue = 2; // Usuario por defecto
      const roleName = anyUser.rol?.name?.toLowerCase();
      console.log('🔍 [HTTP Repo] roleName from payload:', roleName, 'full rol object:', anyUser.rol);
      
      if (roleName === 'admin') roleValue = 0;
      else if (roleName === 'experto') roleValue = 1;
      
      const payload = {
        email: user.email,
        password: password,
        name: user.name,
        role: roleValue
      };

      console.log('📤 [HTTP Repo] Sending register payload:', { ...payload, password: '***' });

      const response = await firstValueFrom(this.http.post<any>(`${this.authUrl}/register`, payload));
      console.log('✅ [HTTP Repo] Register response:', response);
      
      // Mapear respuesta del backend al formato del frontend
      // Backend devuelve: { id, email, name, role: 'Usuario' }
      // Frontend espera: { id, email, name, rol: { name: 'user' } }
      const mappedUser: User = {
        id: response.id,
        email: response.email,
        name: response.name,
        hashedPassword: '', // No lo necesitamos después del registro
        isActive: true,
        date: new Date(),
        rol: {
          id: crypto.randomUUID(),
          name: this.mapBackendRoleToFrontend(response.role) as RolEnum,
          description: ''
        }
      };
      
      return mappedUser;
    } catch (error) {
      console.error('❌ [HTTP Repo] Register error:', error);
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  private mapBackendRoleToFrontend(backendRole: string): string {
    // Backend devuelve: 'Admin', 'Experto', 'Usuario'
    // Frontend espera: 'admin', 'expert', 'user'
    const roleMap: Record<string, string> = {
      'Admin': 'admin',
      'Experto': 'expert',
      'Usuario': 'user'
    };
    return roleMap[backendRole] || 'user';
  }

  async login(email: string, password: string): Promise<{ user: User | null; token?: string }> {
    try {
      const payload = { email, password };
      // El backend devuelve { user: {...}, token: '...' }
      const resp = await firstValueFrom(this.http.post<any>(`${this.authUrl}/login`, payload));
      if (!resp) return { user: null };
      
      const backendUser = resp.user ?? resp;
      const token = resp.token as string | undefined;
      
      // Mapear usuario del backend al formato del frontend
      const mappedUser: User = {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.name,
        hashedPassword: '',
        isActive: true,
        date: new Date(),
        rol: {
          id: crypto.randomUUID(),
          name: this.mapBackendRoleToFrontend(backendUser.role) as RolEnum,
          description: ''
        }
      };
      
      return { user: mappedUser, token };
    } catch (error) {
      // Si es 401 o 404, retornamos null para mantener compatibilidad con el uso actual
      const httpErr = error as HttpErrorResponse;
      if (httpErr?.status === 401 || httpErr?.status === 404) return { user: null };
      this.handleError(httpErr);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      // Esta ruta puede variar según el backend; cambiar si es necesario
      const users = await firstValueFrom(this.http.get<User[]>(`${this.baseUrl}?email=${encodeURIComponent(email)}`));
      return users?.length ? users[0] : null;
    } catch (error) {
      const httpErr = error as HttpErrorResponse;
      if (httpErr?.status === 404) return null;
      this.handleError(httpErr);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const backendUser = await firstValueFrom(this.http.get<any>(`${this.baseUrl}/${id}`));
      if (!backendUser) return null;
      
      // Mapear usuario del backend al formato del frontend
      // Backend devuelve: { id, name, email, rolName: 'Usuario', isActive, createdAt }
      const mappedUser: User = {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.name,
        hashedPassword: '',
        isActive: backendUser.isActive ?? true,
        date: backendUser.createdAt ? new Date(backendUser.createdAt) : new Date(),
        rol: {
          id: crypto.randomUUID(),
          name: this.mapBackendRoleToFrontend(backendUser.rolName) as RolEnum,
          description: ''
        }
      };
      
      return mappedUser;
    } catch (error) {
      const httpErr = error as HttpErrorResponse;
      if (httpErr?.status === 404) return null;
      this.handleError(httpErr);
      throw error;
    }
  }

  async updateUser(userId: string, patch: Partial<User>): Promise<User> {
    try {
      return await firstValueFrom(this.http.patch<User>(`${this.baseUrl}/${userId}`, patch));
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  async getUsers(_user: User): Promise<User[]> {
    try {
      return await firstValueFrom(this.http.get<User[]>(this.baseUrl));
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  private handleError(error: HttpErrorResponse): never {
    console.error('🔴 [HTTP Repo] Full error object:', error);
    console.error('🔴 [HTTP Repo] Status:', error.status);
    console.error('🔴 [HTTP Repo] Error body:', error.error);
    console.error('🔴 [HTTP Repo] Message:', error.message);
    
    let message = 'Error de servidor';
    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor';
    } else if (error.status === 400) {
      message = this.getBadRequestMessage(error);
    } else if (error.status === 401) {
      message = 'No autorizado - credenciales inválidas';
    } else if (error.status === 403) {
      message = 'No tiene permisos para realizar esta acción';
    } else if (error.status === 404) {
      message = 'Usuario no encontrado';
    } else if (error.status >= 500) {
      message = `Error del servidor (${error.status}): ${error.error?.message || error.message}`;
    }
    throw new Error(message);
  }

  private getBadRequestMessage(error: HttpErrorResponse): string {
    if (typeof error.error?.message === 'string') return error.error.message;
    if (error.error?.errors) {
      const messages = Object.values(error.error.errors);
      if (messages.length > 0) return messages.join('. ');
    }
    return 'Datos inválidos';
  }
}
