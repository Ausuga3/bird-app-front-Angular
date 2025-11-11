import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../domain/repositories/token";
import { LoginUserDto } from "../dto/user.dto";
import { UserDomainService } from "../../domain/services/user.domain-service";
import { User } from "../../domain/entities/user.interface";
import { SESSION_REPOSITORY } from "../../domain/repositories/token-sesion";
import { AuthStateService } from "../../../../shared/services/auth-state.service";


@Injectable({ providedIn: 'root' })
export class LoginUserUseCase {
    private readonly userRepository = inject(USER_REPOSITORY);
    private readonly sessionRepository = inject(SESSION_REPOSITORY);
    private readonly authState = inject(AuthStateService);


    async execute(dto: LoginUserDto): Promise<User | null> {
      const active = await this.sessionRepository.getActive();
      if (active) {
        return null;
      }




    // Delegate authentication to the repository (backend) when available.
    const resp = await this.userRepository.login(dto.email, dto.password);
    const user = resp?.user ?? null;
    const token = resp?.token;
    if (!user) return null;

    // Optional domain-side guards (backend should already enforce these)
    if ((user as any).isActive === false) {
      try { console.log('[LoginUserUseCase] login attempt for disabled user', (user as any).id); } catch {}
      return null;
    }

    // Start session and save token (if any)
    await this.sessionRepository.start((user as any).id ?? (user as User).id, token);
    
    // Update AuthState to reflect logged in user
    this.authState.setAuthenticated(user);
    
    try { console.log('[LoginUserUseCase] started session for', (user as any).id ?? (user as User).id, 'and updated AuthState'); } catch {}
    return user;
  }
    
}