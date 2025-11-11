import { inject, Injectable } from "@angular/core";
import { USER_REPOSITORY } from "../../domain/repositories/token";
import { LoginUserDto } from "../dto/user.dto";
import { User } from "../../domain/entities/user.interface";
import { SESSION_REPOSITORY } from "../../domain/repositories/token-sesion";
import { AuthStateService } from "../../../../shared/services/auth-state.service";
import { UserRepository } from "../../domain/repositories/user.repository";
import { SessionRepository } from "../../domain/repositories/sesion.repository";


@Injectable({ providedIn: 'root' })
export class LoginUserUseCase {
    private readonly userRepository = inject(USER_REPOSITORY) as UserRepository;
    private readonly sessionRepository = inject(SESSION_REPOSITORY) as SessionRepository;
    private readonly authState = inject(AuthStateService);


    async execute(dto: LoginUserDto): Promise<User | null> {
      try {
        console.log('[LoginUserUseCase] 🔐 Intentando login con:', dto.email);
        
        // Usar el método login del repositorio HTTP que llama al backend
        const result = await this.userRepository.login(dto.email, dto.password);
        
        if (!result) {
          console.log('[LoginUserUseCase] ❌ Login falló - credenciales inválidas');
          return null;
        }

        const { user, token } = result;
        
        console.log('[LoginUserUseCase] ✅ Login exitoso, usuario:', user);
        console.log('[LoginUserUseCase] 🎟️ Token recibido:', token ? 'Sí' : 'No');

        // Guardar sesión con token
        await this.sessionRepository.start(user.id, token);
        console.log('[LoginUserUseCase] 💾 Sesión guardada para userId:', user.id);

        // Actualizar estado de autenticación
        this.authState.setAuthenticated(user);
        console.log('[LoginUserUseCase] 🎯 AuthState actualizado');

        return user;
      } catch (error) {
        console.error('[LoginUserUseCase] ❌ Error durante login:', error);
        return null;
      }
    }
    
}