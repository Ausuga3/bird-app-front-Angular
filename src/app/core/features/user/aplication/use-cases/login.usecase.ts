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
        return null;
      }




    const user = await this.userRepository.getUserByEmail(dto.email);
    // no existe o no tiene contraseña
    if (!user || !user.hashedPassword) return null;

    // Usuario deshabilitado no puede loguearse
    if (user.isActive === false) {
      try { console.log('[LoginUserUseCase] login attempt for disabled user', user.id); } catch {}
      return null;
    }

    const isValid = UserDomainService.verifyPassword(user.hashedPassword, dto.password );
    if (!isValid) return null;

    await this.sessionRepository.start(user.id);
  try { console.log('[LoginUserUseCase] started session for', user.id); } catch {}
    return user;
  }
    
}