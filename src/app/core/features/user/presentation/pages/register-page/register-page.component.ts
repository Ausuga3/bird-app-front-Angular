import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RegisterComponent } from "../../components/register/register.component";

@Component({
  selector: 'app-register-page',
  imports: [RegisterComponent],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterPageComponent { }
