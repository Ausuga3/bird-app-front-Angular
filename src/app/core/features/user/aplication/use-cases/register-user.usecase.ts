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
  const hashedPassword = UserDomainService.hashPassword(dto.password);
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
    hashedPassword,
    isActive: true,
    date: new Date(),
    rol: role
  };

  // Activar el usuario antes de registrarlo
  const activatedUser = UserDomainService.activateUser(newUser);
  const createdUser = await this.userRepository.register(activatedUser);
  return createdUser;
 }
}