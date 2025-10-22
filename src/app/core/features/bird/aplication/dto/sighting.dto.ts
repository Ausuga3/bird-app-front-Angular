export interface CreateSightingDto {
  coordinates: { latitude: number; longitude: number; };
  country: string;
  birdId: string;
  date: string; // ISO string
  notes?: string;
}

export interface SightingDto {
  id: string;
  coordinates: { latitude: number; longitude: number; };
  country: string;
  birdId: string;
  date: string; 
  notes?: string;
}