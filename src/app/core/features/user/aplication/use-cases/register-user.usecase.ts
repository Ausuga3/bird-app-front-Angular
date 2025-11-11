import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../domain/repositories/token";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.interface";
import { RegisterUserDto } from "../dto/user.dto";
import { UserDomainService } from "../../domain/services/user.domain-service";
import { Rol, RolEnum } from "../../domain/entities/rol.interface";


@Injectable({  providedIn: 'root'})
export class RegisterUserUseCase {
  private readonly userRepository = inject(USER_REPOSITORY);

 async execute(dto: RegisterUserDto): Promise<User>{
    console.log('🎯 [RegisterUserUseCase] Received DTO:', dto);
    
    const roleName = dto.rolName ?? RolEnum.USER;
    const role: Rol = {
      id: crypto.randomUUID(),
      name: roleName,
      description: roleName === RolEnum.EXPERT ? 'Usuario experto' : 'Usuario por defecto'
    };

    // Crear objeto User completo para mantener compatibilidad con ambos repos
    const hashedPassword = UserDomainService.hashPassword(dto.password);
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name: dto.name,
      email: dto.email,
      hashedPassword,
      isActive: true,
      date: new Date(),
      rol: role,
      // Agregar password plano para que HTTP repo lo encuentre
      password: dto.password
    } as any;
  
    console.log('📦 [RegisterUserUseCase] Calling repository.register...');
    
    // Activar el usuario antes de registrarlo
    const activatedUser = UserDomainService.activateUser(newUser);
    const createdUser = await this.userRepository.register(activatedUser);
    return createdUser;
 }
}