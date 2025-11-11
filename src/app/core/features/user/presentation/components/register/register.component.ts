import {  Component, inject, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RegisterUserUseCase } from '../../../aplication/use-cases/register-user.usecase';
import { UpdateUserUseCase } from '../../../aplication/use-cases/updateUser.use-case';
import { LoginUserUseCase } from '../../../aplication/use-cases/login.usecase';
import { User } from '../../../domain/entities/user.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
 
})
export class RegisterComponent implements OnInit, OnChanges {
  @Input() user?: User | null = null;
  @Output() saved = new EventEmitter<User>();

  private fb = inject(FormBuilder);
  private registerUser = inject(RegisterUserUseCase);
  private updateUser = inject(UpdateUserUseCase);
  private loginUser = inject(LoginUserUseCase);
  private router = inject(Router);

  isEdit = false;

  form:FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    terms: [false, [Validators.requiredTrue]]
  });

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (this.user) this.setupEditMode(this.user);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.setupEditMode(changes['user'].currentValue as User);
    }
  }

  private setupEditMode(user: User) {
    this.isEdit = true;
    this.form.patchValue({
      name: user.name ?? '',
      email: user.email ?? ''
    });

    this.form.get('password')?.clearValidators();
    this.form.get('confirmPassword')?.clearValidators();
    this.form.get('terms')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.updateValueAndValidity();
    this.form.get('terms')?.updateValueAndValidity();
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Por favor, complete el formulario correctamente.';
      return;
    }

    const { name, email, password, confirmPassword } = this.form.value;
    console.log('📝 [RegisterComponent] Form values:', { name, email, password: password ? '***' : 'MISSING', confirmPassword: confirmPassword ? '***' : 'MISSING' });

    try {
      if (this.isEdit && this.user) {
        const dto = { userId: this.user.id, name, email };
        const updated = await this.updateUser.execute(this.user.id, dto);
        this.successMessage = 'Usuario actualizado correctamente';
        this.saved.emit(updated);
        console.log('🧩 Usuario actualizado:', updated);
      } else {
        // Validaciones específicas de registro
        if (password !== confirmPassword) {
          this.errorMessage = 'Las contraseñas no coinciden.';
          return;
        }
        console.log('🚀 [RegisterComponent] Calling registerUser.execute with:', { name, email, password: '***' });
        const user = await this.registerUser.execute({ name, email, password });
        this.successMessage = 'Registro exitoso';
        console.log('🧩 Usuario registrado:', user);
        
        // Auto-login después del registro exitoso
        try {
          console.log('🔐 [RegisterComponent] Auto-login after registration...');
          const loggedUser = await this.loginUser.execute({ email, password });
          if (loggedUser) {
            console.log('✅ [RegisterComponent] Auto-login successful, redirecting to mi-perfil...');
            this.router.navigate(['/mi-perfil']);
          }
        } catch (loginError) {
          console.error('❌ Auto-login failed:', loginError);
          // Si falla el auto-login, al menos mostramos éxito del registro
        }
        
        this.saved.emit(user);
        this.form.reset();
      }
    } catch (error) {
      console.error('❌ Error en operación de usuario:', error);
      this.errorMessage = (error as Error)?.message ?? 'Error al procesar la solicitud.';
    }
  }
 }
