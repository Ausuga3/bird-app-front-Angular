import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../../domain/repositories/token";
import { ChangeRoleDto } from "../../dto/user.dto";
import { User } from "../../../domain/entities/user.interface";
import { Rol, RolEnum } from '../../../domain/entities/rol.interface';

@Injectable({providedIn: 'root'})
export class ChangeRolUseCase {
    private readonly userRepository = inject(USER_REPOSITORY);

    async execute(dto: ChangeRoleDto): Promise<User> {
        const admin = await this.userRepository.getUserById(dto.actorId);
        if (!admin) throw new Error('Admin no encontrado');
        if(admin.rol.name !== RolEnum.ADMIN) throw new Error('No tienes permisos para cambiar roles');

        const targetUser = await this.userRepository.getUserById(dto.targetUserId);
        if (!targetUser) throw new Error('Usuario objetivo no encontrado');

        if(targetUser.rol.name === dto.newRol) return targetUser;

        const newRol: Rol = {
            id: crypto.randomUUID(),
            name: dto.newRol,
            description: dto.newRol === RolEnum.EXPERT ? 'Experto en aves' : 'Usuario normal'
        };

        const patch: Partial<User> = { rol: newRol };
        return await this.userRepository.updateUser(targetUser.id, patch);
    }
}