import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent { }
