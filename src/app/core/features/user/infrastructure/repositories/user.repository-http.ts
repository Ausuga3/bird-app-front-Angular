import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.interface';
import { RolEnum } from '../../domain/entities/rol.interface';
import { firstValueFrom } from 'rxjs';

interface BackendUserResponse {
  id: string;
  name: string;
  email: string;
  rolName: string; // Backend devuelve 'rolName' en camelCase: 'Usuario', 'Experto', 'Admin'
  isActive: boolean;
  createdAt: string;
}

interface LoginResponse {
  user: BackendUserResponse;
  token: string;
}

@Injectable()
export class UserRepositoryHttp extends UserRepository {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:5291/api';

  // Mapear role string del backend a RolEnum del frontend
  private mapRoleToEnum(backendRole: string): RolEnum {
    const mapping: Record<string, RolEnum> = {
      'Usuario': RolEnum.USER,
      'Experto': RolEnum.EXPERT,
      'Admin': RolEnum.ADMIN
    };
    return mapping[backendRole] ?? RolEnum.USER;
  }

  // Convertir respuesta del backend a User del frontend
  private mapBackendUserToFrontend(backendUser: BackendUserResponse): User {
    const roleName = this.mapRoleToEnum(backendUser.rolName);
    return {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      rol: { 
        id: crypto.randomUUID(), 
        name: roleName,
        description: backendUser.rolName
      },
      isActive: backendUser.isActive,
      date: new Date(backendUser.createdAt)
    };
  }

  async register(user: User): Promise<User> {
    try {
      console.log('[UserRepositoryHttp] 📤 Registrando usuario:', user.email);
      
      // Backend espera PascalCase y Role como string enum ("Usuario", "Experto", "Admin")
      const payload = {
        Email: user.email,
        Password: (user as any).password, // Usar password sin hashear
        Name: user.name,
        Role: "Usuario" // Por defecto todos los nuevos usuarios son "Usuario"
      };

      console.log('[UserRepositoryHttp] 📦 Payload enviado:', payload);

      const response = await firstValueFrom(
        this.http.post<BackendUserResponse>(`${this.API_URL}/Auth/register`, payload)
      );

      console.log('[UserRepositoryHttp] ✅ Usuario registrado:', response);
      return this.mapBackendUserToFrontend(response);
    } catch (error: any) {
      console.error('[UserRepositoryHttp] ❌ Error al registrar:', error);
      console.error('[UserRepositoryHttp] 💥 Error completo:', JSON.stringify(error, null, 2));
      if (error.error) {
        console.error('[UserRepositoryHttp] 🔍 Error.error:', error.error);
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      console.log('[UserRepositoryHttp] 🔐 Login:', email);
      
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.API_URL}/Auth/login`, { email, password })
      );

      if (!response || !response.user || !response.token) {
        console.log('[UserRepositoryHttp] ❌ Login falló - respuesta inválida');
        return null;
      }

      const user = this.mapBackendUserToFrontend(response.user);
      console.log('[UserRepositoryHttp] ✅ Login exitoso:', user);
      
      return { user, token: response.token };
    } catch (error: any) {
      if (error.status === 401 || error.status === 400) {
        console.log('[UserRepositoryHttp] ❌ Credenciales inválidas');
        return null;
      }
      console.error('[UserRepositoryHttp] ❌ Error en login:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('[UserRepositoryHttp] 🔍 Buscando usuario por email:', email);
      const response = await firstValueFrom(
        this.http.get<BackendUserResponse>(`${this.API_URL}/Users/email/${email}`)
      );
      return this.mapBackendUserToFrontend(response);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      console.error('[UserRepositoryHttp] ❌ Error al buscar por email:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      console.log('[UserRepositoryHttp] 🔍 Obteniendo usuario por ID:', id);
      const response = await firstValueFrom(
        this.http.get<BackendUserResponse>(`${this.API_URL}/Users/${id}`)
      );
      console.log('[UserRepositoryHttp] 📦 Respuesta cruda del backend:', response);
      const user = this.mapBackendUserToFrontend(response);
      console.log('[UserRepositoryHttp] ✅ Usuario mapeado:', user);
      return user;
    } catch (error: any) {
      if (error.status === 404) {
        console.log('[UserRepositoryHttp] ⚠️ Usuario no encontrado');
        return null;
      }
      console.error('[UserRepositoryHttp] ❌ Error al obtener usuario:', error);
      throw error;
    }
  }

  async updateUser(userId: string, patch: Partial<User>): Promise<User> {
    try {
      console.log('[UserRepositoryHttp] 📝 Actualizando usuario:', userId, patch);
      
      // Convertir el patch del frontend al formato del backend
      const backendPatch: any = {};
      
      if (patch.name) {
        backendPatch.Name = patch.name;
      }
      
      if (patch.email) {
        backendPatch.Email = patch.email;
      }
      
      if (patch.rol) {
        // Convertir RolEnum del frontend a Role string del backend
        const roleMapping: Record<RolEnum, string> = {
          [RolEnum.USER]: 'Usuario',
          [RolEnum.EXPERT]: 'Experto',
          [RolEnum.ADMIN]: 'Admin'
        };
        backendPatch.Role = roleMapping[patch.rol.name];
      }
      
      if (patch.isActive !== undefined) {
        backendPatch.IsActive = patch.isActive;
      }

      console.log('[UserRepositoryHttp] 📦 Payload backend:', backendPatch);

      const response = await firstValueFrom(
        this.http.put<BackendUserResponse>(`${this.API_URL}/Users/${userId}`, backendPatch)
      );
      return this.mapBackendUserToFrontend(response);
    } catch (error) {
      console.error('[UserRepositoryHttp] ❌ Error al actualizar usuario:', error);
      throw error;
    }
  }

  async getUsers(users: User): Promise<User[]> {
    try {
      console.log('[UserRepositoryHttp] 📋 Obteniendo lista de usuarios');
      const response = await firstValueFrom(
        this.http.get<BackendUserResponse[]>(`${this.API_URL}/Users`)
      );
      return response.map(u => this.mapBackendUserToFrontend(u));
    } catch (error) {
      console.error('[UserRepositoryHttp] ❌ Error al obtener usuarios:', error);
      throw error;
    }
  }
}
