import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Bird } from '../../domain/entities/bird.interface';
import { BirdRepository } from '../../domain/repositories/bird.repository';

@Injectable()
export class BirdHttpRepository implements BirdRepository {
  private http = inject(HttpClient);
  
  // TODO: Mover a environment cuando se configure
  private baseUrl = '/api/birds';
  
  async addBird(bird: Bird): Promise<Bird> {
    try {
      // Omitimos id en la creación - el backend lo asignará
      const { id, ...birdData } = bird;
      return await firstValueFrom(
        this.http.post<Bird>(this.baseUrl, birdData)
      );
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  async getAllBirds(): Promise<Bird[]> {
    try {
      return await firstValueFrom(
        this.http.get<Bird[]>(this.baseUrl)
      );
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  async getBirdById(id: string): Promise<Bird | null> {
    try {
      const bird = await firstValueFrom(
        this.http.get<Bird>(`${this.baseUrl}/${id}`)
      );
      return bird;
    } catch (error) {
      // Si es 404, retornamos null en lugar de lanzar error
      if ((error as HttpErrorResponse).status === 404) {
        return null;
      }
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  async editBird(id: string, patch: Partial<Bird>): Promise<Bird> {
    try {
      return await firstValueFrom(
        this.http.patch<Bird>(`${this.baseUrl}/${id}`, patch)
      );
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  async deleteBird(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.baseUrl}/${id}`)
      );
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
      throw error;
    }
  }

  /**
   * Maneja errores HTTP comunes y los traduce a mensajes de dominio
   */
  private handleError(error: HttpErrorResponse): never {
    let message = 'Error de servidor';
    
    if (error.status === 0) {
      message = 'No se pudo conectar con el servidor';
    } else if (error.status === 400) {
      message = this.getBadRequestMessage(error);
    } else if (error.status === 401) {
      message = 'No autorizado - inicie sesión';
    } else if (error.status === 403) {
      message = 'No tiene permisos para realizar esta acción';
    } else if (error.status === 404) {
      message = 'Ave no encontrada';
    }

    throw new Error(message);
  }

  /**
   * Extrae mensaje de error de una respuesta 400 Bad Request
   * Soporta tanto errores simples como validaciones estructuradas
   */
  private getBadRequestMessage(error: HttpErrorResponse): string {
    // Si el backend envía un mensaje directo
    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }
    
    // Si envía errores de validación estructurados
    if (error.error?.errors) {
      const messages = Object.values(error.error.errors);
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
    
    return 'Datos inválidos';
  }
}