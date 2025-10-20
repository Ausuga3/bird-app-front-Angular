import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../domain/repositories/token";
import { LoginUserDto } from "../dto/user.dto";
import { UserDomainService } from "../../domain/services/user.domain-service";
import { User } from "../../domain/entities/user.interface";
import { SESSION_REPOSITORY } from "../../domain/repositories/token-sesion";


@Injectable({ providedIn: 'root' })
export class LoginUserUseCase {
    private readonly userRepository = inject(USER_REPOSITORY);
    private readonly sessionRepository = inject(SESSION_REPOSITORY);

    async execute(dto: LoginUserDto): Promise<User | null> {
      const active = await this.sessionRepository.getActive();
      if (active) {
        // Hay una sesión activa: no permitir nuevo login
        // Devolver null para indicar que la acción no se permitió
        return null;
      }




    const user = await this.userRepository.getUserByEmail(dto.email);
    if (!user || !user.hashedPassword) return null;

    const isValid = UserDomainService.verifyPassword(user.hashedPassword, dto.password );
    if (!isValid) return null;

    await this.sessionRepository.start(user.id);
  try { console.log('[LoginUserUseCase] started session for', user.id); } catch {}
    return user;
  }
    
}