import { inject, Injectable } from "@angular/core";
import { BirdRepository } from "../../domain/repositories/bird.repository";
import { AuthStateService } from "../../../../shared/services/auth-state.service";



@Injectable({ providedIn: 'root' })
export class DeletedBirdUseCase {
    private readonly birdRepo = inject(BirdRepository);
    private readonly auth = inject(AuthStateService);

    constructor(){}
    async execute(id:string):Promise<void>{
        if(!id) throw new Error('id required');

        const bird = await this.birdRepo.getBirdById(id);
        if(!bird) throw new Error('Ave no encontrada');

        const user = this.auth.getUser();
        if (!user) throw new Error('No has inciciado sesión');

        const isAdmin = user?.rol?.name === 'admin';
        const isOwner = user.id === bird.created_by; 

        if(!isAdmin && !isOwner){
            throw new Error('No tienes permitido eliminar esto');
        }

        await this.birdRepo.deleteBird(id);
    }
}