import { BirdFamily, ConservationStatusEnum } from "../../domain/entities/bird.interface";

export interface AddBirdDto{
    commonName: string;
    scientificName: string;
    family: BirdFamily;
    notes: string;
    conservationStatus: ConservationStatusEnum;
    
}