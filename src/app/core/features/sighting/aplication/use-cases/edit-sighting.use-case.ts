import { Injectable } from "@angular/core";
import { SightingRepository } from "../../domain/repositories/sighting.repository";
import { AuthStateService } from "../../../../shared/services/auth-state.service";
import { UpdateSightingDto } from '../dto/sighting.dto';
import { Sighting } from "../../domain/entities/sighting.interface";


@Injectable({providedIn: 'root'})
export class UpdateSightingUseCase{
    constructor(
        private readonly sightingRepository: SightingRepository,
        private readonly authState: AuthStateService
    ) {}

    async execute(id: string, dto:UpdateSightingDto): Promise<Sighting>{
        const existing = await this.sightingRepository.getSightingById(id);
        if(!existing){
            throw new Error('Avistamiento no encontrado');
        }

        const currentUser = await this.authState.getUser();
        const isAdmin = currentUser?.rol?.name === 'admin';
        if(!isAdmin && existing.created_by !== currentUser?.id){
            throw new Error('No autorizado para editar este avistamiento');
        }

        const allowedKeys = Object.keys(dto) as (keyof UpdateSightingDto)[];
        for (const key of allowedKeys) {
            // asignación dinámica intencional — casteo puntual para evitar la directiva @ts-expect-error
            if (dto[key] !== undefined) (existing as any)[key] = dto[key] as any;
        }

        const updated = await this.sightingRepository.editSighting(id, existing);
        return updated;

    }
}
