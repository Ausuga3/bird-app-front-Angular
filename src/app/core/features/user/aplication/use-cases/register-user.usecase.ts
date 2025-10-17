import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../domain/repositories/token";
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.interface";
import { RegisterUserDto } from "../dto/user.dto";
import { UserDomainService } from "../../domain/services/user.domain-service";


@Injectable({  providedIn: 'root'})
export class RegisterUserUseCase {
  private readonly userRepository = inject(USER_REPOSITORY);

 async execute(dto: RegisterUserDto): Promise<User>{
  const hashedPassword = UserDomainService.hashPassword(dto.password);

  const newUser:User = {
    id: crypto.randomUUID(),
    name: dto.name,
    email: dto.email,
    hashedPassword,
    isActive: false,
    date: new Date()
  };

  const createdUser = await this.userRepository.register(newUser);
  return UserDomainService.activateUser(createdUser);
 }
}