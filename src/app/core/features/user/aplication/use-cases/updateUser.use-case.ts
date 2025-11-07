import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable } from "@angular/core";
import { User } from "../../domain/entities/user.interface";
import { UserRepository } from "../../domain/repositories/user.repository";
import { AuthStateService } from "../../../../shared/services/auth-state.service";
import { UpdateUserDto } from "../dto/user.dto";
import { USER_REPOSITORY } from "../../domain/repositories/token";




@Injectable({providedIn: 'root'})
export class UpdateUserUseCase {
    // Usar el token de proveedor consistente con el resto del código
    private readonly userRepository = inject(USER_REPOSITORY) as UserRepository;
    private readonly authState = inject(AuthStateService);

    async execute(id: string, dto: UpdateUserDto): Promise<User> {
        const existing =  await this.userRepository.getUserById(id);
        if(!existing){
            throw new Error('Usuario no encontrado');
        }

        const currentUser = await this.authState.getUser();
        const isAdmin = currentUser?.rol?.name === 'admin';
        if(!isAdmin && existing.id !== currentUser?.id){
            throw new Error('No autorizado para editar este usuario');
        }

        const updated = await this.userRepository.updateUser(id, dto);
        return updated;
    }
}