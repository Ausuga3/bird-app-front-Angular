import { BirdFamily, ConservationStatusEnum } from "../../domain/entities/bird.interface";

export interface AddBirdDto{
    commonName: string;
    scientificName: string;
    family: BirdFamily;
    notes: string;
    conservationStatus: ConservationStatusEnum;
    created_by?: string;
    
}

export interface birdDto{
    id: string;
    commonName: string;
    scientificName: string;
    family: BirdFamily;
    notes: string;
    conservationStatus: ConservationStatusEnum;
    created_by?: string;
    created_At?: Date;
    updated_At?: Date;
}

export interface UpdateBirdDto{
    commonName?: string;
    scientificName?: string;
    family?: BirdFamily;
    notes?: string;
    conservationStatus?: ConservationStatusEnum;
    updated_At?: Date;
}