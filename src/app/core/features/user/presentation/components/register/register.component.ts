import {  Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RegisterUserUseCase } from '../../../aplication/use-cases/register-user.usecase';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
 
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private registerUser = inject(RegisterUserUseCase);

  form:FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    terms: [false, [Validators.requiredTrue]]
  });

  errorMessage = '';
  successMessage = '';

  async onSubmit() {
    console.log('➡️ Formulario enviado');
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Por favor, complete el formulario correctamente.';
      return;
    }

    const { name, email, password, confirmPassword } = this.form.value;

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    try{
      const user = await this.registerUser.execute({ name, email, password });
        this.successMessage = 'Registro exitoso';
      console.log('🧩 Usuario registrado:', user);
      this.form.reset();
    } catch (error) {
      console.error('❌ Error al registrar usuario:', error);
      this.errorMessage = 'Error al registrar usuario.';
    }
  }
 }
