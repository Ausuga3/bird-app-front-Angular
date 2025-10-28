import { Bird } from "../../../bird/domain/entities/bird.interface";

export interface Sighting {
    id?: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    country: string;
    bird: Bird;
    created_at: Date; 
    updated_at: Date;
    notes?: string;
}