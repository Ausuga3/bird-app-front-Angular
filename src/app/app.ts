import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./core/shared/components/navbar/navbar.component";
import { USER_REPOSITORY } from './core/features/user/domain/repositories/token';
import { UserRepositoryMock } from './core/features/user/infrastructure/repositories/user.repository.mock';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers:[
   { provide: USER_REPOSITORY,
    useClass: UserRepositoryMock
  }
  ]
})
export class App {
  protected readonly title = signal('bird-app');
}
