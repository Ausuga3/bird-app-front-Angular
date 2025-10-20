import { Bird } from '../entities/bird.interface';

export abstract class BirdRepository{
    abstract addBird(bird:Bird): Promise<Bird>;
    abstract getAllBirds(): Promise<Bird[]>;
    abstract getBirdById(id:string): Promise<Bird | null>;
    abstract editBird(id: string, patch: Partial<Bird>): Promise<Bird>;
    abstract deleteBird(id:string): Promise<void>;
}
