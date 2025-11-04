import { inject, Injectable } from "@angular/core";
import { BirdRepository } from "../../domain/repositories/bird.repository";
import { Bird } from "../../domain/entities/bird.interface";


@Injectable({ providedIn: 'root' })
export class ListBirdUseCase {
    private repo = inject(BirdRepository);

    async execute():Promise<Bird[]> {
        return this.repo.getAllBirds();
    }

    async executeByUser(id:string):Promise<Bird | null> {
       if(!id) return null;

        return this.repo.getBirdById(id);
    }
    
}