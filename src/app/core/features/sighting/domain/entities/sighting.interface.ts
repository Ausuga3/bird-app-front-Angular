import { Bird } from "../../../bird/domain/entities/bird.interface";

export interface Sighting {
    id?: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    country: string;
    bird: Bird;
    // id del usuario que creó el avistamiento (opcional)
    created_by?: string;
    created_at: Date; 
    updated_at: Date;
    notes?: string;
}