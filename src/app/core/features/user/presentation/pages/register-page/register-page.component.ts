import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RegisterComponent } from "../../components/register/register.component";
import { ActivatedRoute, Router } from '@angular/router';
import { USER_REPOSITORY } from '../../../domain/repositories/token';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.interface';

@Component({
  selector: 'app-register-page',
  imports: [RegisterComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userRepo = inject(USER_REPOSITORY) as UserRepository;

  user?: User | null = null;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return; // modo registro
    try {
      this.user = await this.userRepo.getUserById(id);
    } catch (err) {
      console.error('Error cargando usuario para editar', err);
      // opcional: redirigir si no se encuentra
      // this.router.navigate(['/mi-perfil']);
    }
  }

  // handler opcional para cuando el formulario emite saved
  onSaved(updated: User) {
    // navegar a mi-perfil o actualizar vista
    this.router.navigate(['/mi-perfil']);
  }
}
