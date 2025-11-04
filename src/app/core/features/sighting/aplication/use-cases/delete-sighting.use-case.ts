import { Injectable, inject } from "@angular/core";
import { SightingRepository } from "../../domain/repositories/sighting.repository";
import { AuthStateService } from '../../../../shared/services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class DeleteSightingUseCase {
    private readonly sightRepo = inject(SightingRepository);
    private readonly auth = inject(AuthStateService);

    constructor() {}
    async execute(id: string): Promise<void> {
        if (!id) throw new Error('id required');

        const sighting = await this.sightRepo.getSightingById(id);
        if (!sighting) throw new Error('Avistamiento no encontrado');

        const user = this.auth.getUser();
        if (!user) throw new Error('No has inciciado sesión');

        const isAdmin = user?.rol?.name === 'admin';
        const isOwner = user.id === sighting.created_by;

        if (!isAdmin && !isOwner) {
            throw new Error('No tienes permitido eliminar esto');
        }

        await this.sightRepo.deleteSighting(id);
    }
}