export interface CreateSightingDto {
  coordinates: { latitude: number; longitude: number; };
  country: string;
  birdId: string;
  date: string; 
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

export interface UpdateSightingDto {
  coordinates?: { latitude: number; longitude: number; };
  country?: string;
  birdId?: string;
  date?: string; 
  notes?: string;
}

export interface viewSightingDto {
  id: string;
  coordinates: { latitude: number; longitude: number; };
  country: string;
  birdId: string;
  created_At: Date;
  updated_At: Date;
  notes?: string;
  userId: string;
  birdCommonName?: string;
  birdScientificName?: string;
  userName?: string;
}