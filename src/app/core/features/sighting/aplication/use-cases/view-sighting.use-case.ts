import { Injectable, inject } from "@angular/core";
import { SightingRepository } from "../../domain/repositories/sighting.repository";
import { viewSightingDto } from "../dto/sighting.dto";
import { USER_REPOSITORY } from "../../../user/domain/repositories/token";
import { UserRepository } from "../../../user/domain/repositories/user.repository";

@Injectable({ providedIn: 'root' })
export class ViewSightingUseCase {
	private readonly sightRepo = inject(SightingRepository);
	private readonly userRepo = inject(USER_REPOSITORY) as UserRepository;

	constructor() {}

	async execute(id: string): Promise<viewSightingDto> {
		if (!id) throw new Error('id required');

		const sighting = await this.sightRepo.viewSighting(id);
		if (!sighting) throw new Error('Avistamiento no encontrado');

		let userName: string | undefined;
		if (sighting.created_by) {
			const user = await this.userRepo.getUserById(sighting.created_by);
			// If user exists use the name, otherwise fall back to the id so the UI can show it
			userName = user?.name ?? sighting.created_by;
		}

		return {
			id: sighting.id ?? '',
			coordinates: sighting.coordinates,
			country: sighting.country,
			birdId: sighting.bird?.id ?? '',
			created_At: sighting.created_at,
			updated_At: sighting.updated_at,
			notes: sighting.notes,
			userId: sighting.created_by ?? '',
			birdCommonName: sighting.bird?.commonName,
			birdScientificName: sighting.bird?.scientificName,
			userName,
		};
	}
}

