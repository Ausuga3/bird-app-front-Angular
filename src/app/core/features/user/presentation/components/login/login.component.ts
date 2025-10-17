import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {  FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginUserUseCase } from '../../../aplication/use-cases/login.usecase';
import { Router } from '@angular/router'; // <-- agregado

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
  private router = inject(Router); // <-- agregado

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
        await this.router.navigate(['/'], { replaceUrl: true }); // <-- navegación al dashboard
      }else{
        this.errorMessage = 'Credenciales inválidas.';
      }
    }catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      this.errorMessage = 'Error al iniciar sesión.';
    } 
    }
  }
