import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoginComponent } from "../../components/login/login.component";

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPageComponent { }
