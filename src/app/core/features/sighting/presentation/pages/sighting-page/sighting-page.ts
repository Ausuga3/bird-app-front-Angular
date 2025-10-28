import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormSighting } from "../../components/forms/form-sighting/form-sighting";

@Component({
  selector: 'app-sighting-page',
  imports: [FormSighting],
  templateUrl: './sighting-page.html',
  styleUrl: './sighting-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SightingPage { }
