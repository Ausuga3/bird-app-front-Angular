export interface Bird{
    id: string;
    commonName: string;
    scientificName: string;
    family: BirdFamily;
    notes: string;
    conservationStatus: ConservationStatusEnum;
    created_at: Date;
    updated_at: Date;
}

export enum ConservationStatusEnum{
    extinct = 'Extinta',
    endangered = 'En Peligro',
    vulnerable = 'Vulnerable',
    nearThreatened = 'Casi Amenazada',
    leastConcern = 'Preocupacion Menor',
    notEvaluated = 'No Evaluada'
}
export enum BirdFamily {
  Accipitridae = 'Rapaces diurnas (halcones, águilas, gavilanes)',
  Anatidae = 'Patos, gansos y cisnes',
  Columbidae = 'Palomas y tórtolas',
  Trochilidae = 'Colibríes',
  Psittacidae = 'Loros y guacamayas',
  Strigidae = 'Búhos y lechuzas',
  Tyrannidae = 'Atrapamoscas y mosqueros',
  Thraupidae = 'Tangaras',
  Turdidae = 'Mirlos y zorzales',
  Emberizidae = 'Pinzones y semilleros',
  Picidae = 'Pájaros carpinteros',
  Ardeidae = 'Garzas y garcetas',
  Falconidae = 'Halcones y cernícalos'
}

