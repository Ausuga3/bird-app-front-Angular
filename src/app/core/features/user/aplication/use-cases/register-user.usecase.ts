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
  // NO hasheamos la contraseña aquí - el backend lo hace con BCrypt
  const roleName = dto.rolName ?? RolEnum.USER;
  const role: Rol = {
    id: crypto.randomUUID(),
    name: roleName,
    description: roleName === RolEnum.EXPERT ? 'Usuario por defecto' : ''
  };

  const newUser:User = {
    id: crypto.randomUUID(),
    name: dto.name,
    email: dto.email,
    hashedPassword: '', // El backend lo generará
    isActive: true,
    date: new Date(),
    rol: role
  };

  // Adjuntar el password sin hashear para que el repositorio lo envíe al backend
  (newUser as any).password = dto.password;

  // Activar el usuario antes de registrarlo
  const activatedUser = UserDomainService.activateUser(newUser);
  const createdUser = await this.userRepository.register(activatedUser);
  return createdUser;
 }
}