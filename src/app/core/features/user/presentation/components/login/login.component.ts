import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {  FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginUserUseCase } from '../../../aplication/use-cases/login.usecase';
import { Router } from '@angular/router'; 
import { AuthStateService } from '../../../../../shared/services/auth-state.service';
import { SESSION_REPOSITORY } from '../../../domain/repositories/token-sesion';
import { SessionRepository } from '../../../domain/repositories/sesion.repository';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent { 
  private fb = inject(FormBuilder);
  private loginUser = inject(LoginUserUseCase);
  private router = inject(Router); 
  private authState = inject(AuthStateService);
  private sessionRepository = inject(SESSION_REPOSITORY) as SessionRepository;

  form:FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage = '';
  successMessage = '';

  async onSubmit() {
    console.log('➡️ Formulario de login enviado');

    this.errorMessage = '';
    this.successMessage = '';

    // Verificación adicional leyendo directamente la fuente de sesión (storage)
    try {
      const active = await this.sessionRepository.getActive();
      if (active) {
        this.errorMessage = 'Ya existe una sesión activa. Cierre sesión antes de iniciar una nueva.';
        return;
      }
    } catch (err) {
      // Si hay error al leer storage, seguir con la validación por signals
      if (this.authState.isAuthenticated()) {
        this.errorMessage = 'Ya existe una sesión activa. Cierre sesión antes de iniciar una nueva.';
        return;
      }
    }


    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Por favor, complete el formulario correctamente.';
      return;
    }

    const { email, password } = this.form.value;
    try {
      const user = await this.loginUser.execute({ email, password });
      if (user) {
        this.successMessage = 'Inicio de sesión exitoso';
  // Actualizar el estado de autenticación para que el navbar reaccione
  this.authState.setAuthenticated(user);
  try { console.log('[LoginComponent] authState setAuthenticated ->', this.authState.isAuthenticated()); } catch {}
        await this.router.navigate(['/'], { replaceUrl: true });
      }else{
        // Puede deberse a credenciales inválidas o a que ya existe una sesión activa
        this.errorMessage = 'Credenciales inválidas o ya existe una sesión activa.';
      }
    }catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      this.errorMessage = 'Error al iniciar sesión.';
    } 
    }
  }
