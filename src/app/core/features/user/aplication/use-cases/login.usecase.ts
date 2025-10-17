import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../domain/repositories/token";
import { LoginUserDto } from "../dto/user.dto";
import { UserDomainService } from "../../domain/services/user.domain-service";
import { User } from "../../domain/entities/user.interface";


@Injectable({ providedIn: 'root' })
export class LoginUserUseCase {
    private readonly userRepository = inject(USER_REPOSITORY);

    async execute(dto: LoginUserDto): Promise<User | null> {
    const user = await this.userRepository.getUserByEmail(dto.email);
    if (!user || !user.hashedPassword) return null;

    const isValid = UserDomainService.verifyPassword(user.hashedPassword, dto.password );
    return isValid ? user : null;
  }
    
}