import { Bird } from "./bird.interface";


export interface Sighting {
    id?: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    country: string;
    bird: Bird;
    date: Date;
    notes?: string;

}