import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landin-page',
  imports: [RouterLink],
  templateUrl: './landin-page.component.html',
  styleUrls: ['./landin-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandinPageComponent { }
