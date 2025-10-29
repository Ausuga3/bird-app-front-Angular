
import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../domain/repositories/token";
import { getUsersDto } from "../dto/user.dto";
import { User } from "../../domain/entities/user.interface";
import { RolEnum } from '../../domain/entities/rol.interface';

@Injectable({providedIn: 'root'})
export class GetUsersUseCase {
	private readonly userRepository = inject(USER_REPOSITORY);

	async execute(dto: getUsersDto): Promise<User[]> {

		const all = await this.userRepository.getUsers({} as User);

		let result = all;

		if (dto.name && dto.name.trim() !== '') {
			const q = dto.name.toLowerCase();
			result = result.filter(u => u.name?.toLowerCase().includes(q));
		}

		if (dto.email && dto.email.trim() !== '') {
			const q = dto.email.toLowerCase();
			result = result.filter(u => u.email?.toLowerCase().includes(q));
		}

		if (dto.rolName) {
			result = result.filter(u => u.rol?.name === dto.rolName);
		}

		return result;
	}

	
	async toggleActive(actorId: string, targetUserId: string, enable: boolean): Promise<User> {
		const actor = await this.userRepository.getUserById(actorId);
		if (!actor) throw new Error('Actor (usuario) no encontrado');
		if (actor.rol?.name !== RolEnum.ADMIN) throw new Error('No tienes permisos para cambiar el estado del usuario');

		const target = await this.userRepository.getUserById(targetUserId);
		if (!target) throw new Error('Usuario objetivo no encontrado');

		if (target.isActive === enable) return target; 

		const updated: User = { ...target, isActive: enable };
		return await this.userRepository.updateUser(updated);
        
	}
}

