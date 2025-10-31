import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../domain/repositories/token";
import { ChangeActiveDto } from "../dto/user.dto";
import { User } from "../../domain/entities/user.interface";
import { RolEnum } from '../../domain/entities/rol.interface';

@Injectable({providedIn: 'root'})
export class ChangeActiveUseCase {
    private readonly userRepository = inject(USER_REPOSITORY);

    async execute(dto: ChangeActiveDto): Promise<User> {
        const admin = await this.userRepository.getUserById(dto.actorId);
        if (!admin) throw new Error('Admin no encontrado');
        if (admin.rol.name !== RolEnum.ADMIN) throw new Error('No tienes permisos para cambiar estado de usuario');

        const targetUser = await this.userRepository.getUserById(dto.targetUserId);
        if (!targetUser) throw new Error('Usuario objetivo no encontrado');

        if (targetUser.isActive === dto.isActive) return targetUser;

        const updatedUser: User = { ...targetUser, isActive: dto.isActive };
        return await this.userRepository.updateUser(updatedUser);
    }
}
