import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Bird, BirdFamily, ConservationStatusEnum } from '../../domain/entities/bird.interface';
import { BirdRepository } from '../../domain/repositories/bird.repository';
import { environment } from '../../../../../../environments/environment';

@Injectable()
export class BirdHttpRepository implements BirdRepository {
  private http = inject(HttpClient);
  
  private baseUrl = `${environment.apiUrl}/birds`;

  /**
   * Mapea el enum BirdFamily del frontend (valor español) al nombre del enum del backend
   */
  private mapFamilyToBackend(family: BirdFamily): string {
    const familyMapping: Record<string, string> = {
      'Rapaces diurnas (halcones, águilas, gavilanes)': 'Accipitridae',
      'Patos, gansos y cisnes': 'Anatidae',
      'Palomas y tórtolas': 'Columbidae',
      'Colibríes': 'Trochilidae',
      'Loros y guacamayas': 'Psittacidae',
      'Búhos y lechuzas': 'Strigidae',
      'Atrapamoscas y mosqueros': 'Tyrannidae',
      'Tangaras': 'Thraupidae',
      'Mirlos y zorzales': 'Turdidae',
      'Pinzones y semilleros': 'Emberizidae',
      'Pájaros carpinteros': 'Picidae',
      'Garzas y garcetas': 'Ardeidae',
      'Halcones y cernícalos': 'Falconidae'
    };
    
    return familyMapping[family] || family;
  }

  /**
   * Mapea el nombre del enum BirdFamily del backend al valor español del frontend
   */
  private mapFamilyFromBackend(familyName: string): BirdFamily {
    const backendToFrontend: Record<string, BirdFamily> = {
      'Accipitridae': BirdFamily.Accipitridae,
      'Anatidae': BirdFamily.Anatidae,
      'Columbidae': BirdFamily.Columbidae,
      'Trochilidae': BirdFamily.Trochilidae,
      'Psittacidae': BirdFamily.Psittacidae,
      'Strigidae': BirdFamily.Strigidae,
      'Tyrannidae': BirdFamily.Tyrannidae,
      'Thraupidae': BirdFamily.Thraupidae,
      'Turdidae': BirdFamily.Turdidae,
      'Emberizidae': BirdFamily.Emberizidae,
      'Picidae': BirdFamily.Picidae,
      'Ardeidae': BirdFamily.Ardeidae,
      'Falconidae': BirdFamily.Falconidae
    };
    
    return backendToFrontend[familyName] || BirdFamily.Accipitridae;
  }

  /**
   * Mapea el enum ConservationStatus del frontend al nombre del enum del backend
   */
  private mapConservationStatusToBackend(status: ConservationStatusEnum): string {
    const statusMapping: Record<string, string> = {
      'Extinta': 'Extinct',
      'En Peligro': 'Endangered',
      'Vulnerable': 'Vulnerable',
      'Casi Amenazada': 'NearThreatened',
      'Preocupacion Menor': 'LeastConcern',
      'No Evaluada': 'NotEvaluated'
    };
    
    return statusMapping[status] || status;
  }

  /**
   * Mapea el nombre del enum ConservationStatus del backend al valor español del frontend
   */
  private mapConservationStatusFromBackend(statusName: string): ConservationStatusEnum {
    const backendToFrontend: Record<string, ConservationStatusEnum> = {
      'Extinct': ConservationStatusEnum.extinct,
      'Endangered': ConservationStatusEnum.endangered,
      'Vulnerable': ConservationStatusEnum.vulnerable,
      'NearThreatened': ConservationStatusEnum.nearThreatened,
      'LeastConcern': ConservationStatusEnum.leastConcern,
      'NotEvaluated': ConservationStatusEnum.notEvaluated
    };
    
    return backendToFrontend[statusName] || ConservationStatusEnum.notEvaluated;
  }

  /**
   * Transforma un ave del backend al formato del frontend
   */
  private transformBirdFromBackend(backendBird: any): Bird {
    return {
      id: backendBird.id,
      commonName: backendBird.commonName,
      scientificName: backendBird.scientificName,
      family: this.mapFamilyFromBackend(backendBird.family),
      conservationStatus: this.mapConservationStatusFromBackend(backendBird.conservationStatus),
      notes: backendBird.notes,
      created_at: new Date(backendBird.created_At || backendBird.createdAt),
      updated_at: new Date(backendBird.updated_At || backendBird.updatedAt),
      created_by: backendBird.created_By || backendBird.createdBy
    };
  }
  
  async addBird(bird: Bird): Promise<Bird> {
    try {
      // El backend espera solo estos campos (CreateBirdCommand)
      const birdData = {
        commonName: bird.commonName,
        scientificName: bird.scientificName,
        family: this.mapFamilyToBackend(bird.family), // Mapear al nombre del enum
        conservationStatus: this.mapConservationStatusToBackend(bird.conservationStatus), // Mapear al nombre del enum
        notes: bird.notes
      };
      
      console.log('[BirdHttpRepository] 📤 Enviando ave al backend:', birdData);
      
      const response = await firstValueFrom(
        this.http.post<any>(this.baseUrl, birdData)
      );
      
      // Transformar la respuesta del backend al formato del frontend
      return this.transformBirdFromBackend(response);
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
    }
  }

  async getAllBirds(): Promise<Bird[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<any[]>(this.baseUrl)
      );
      
      // Transformar cada ave del backend al formato del frontend
      return response.map(bird => this.transformBirdFromBackend(bird));
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
    }
  }

  async getBirdById(id: string): Promise<Bird | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${this.baseUrl}/${id}`)
      );
      
      // Transformar la respuesta del backend al formato del frontend
      return this.transformBirdFromBackend(response);
    } catch (error) {
      // Si es 404, retornamos null en lugar de lanzar error
      if ((error as HttpErrorResponse).status === 404) {
        return null;
      }
      this.handleError(error as HttpErrorResponse);
    }
  }

  async editBird(id: string, patch: Partial<Bird>): Promise<Bird> {
    try {
      // El backend espera PUT con el body completo (UpdateBirdCommand)
      const birdData = {
        commonName: patch.commonName,
        scientificName: patch.scientificName,
        family: patch.family ? this.mapFamilyToBackend(patch.family) : undefined,
        conservationStatus: patch.conservationStatus ? this.mapConservationStatusToBackend(patch.conservationStatus) : undefined,
        notes: patch.notes
      };
      
      const response = await firstValueFrom(
        this.http.put<any>(`${this.baseUrl}/${id}`, birdData)
      );
      
      // Transformar la respuesta del backend al formato del frontend
      return this.transformBirdFromBackend(response);
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
    }
  }

  async deleteBird(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.baseUrl}/${id}`)
      );
    } catch (error) {
      this.handleError(error as HttpErrorResponse);
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