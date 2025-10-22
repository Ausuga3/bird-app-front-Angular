import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormSighting } from "../../components/forms/form-sighting/form-sighting";

@Component({
  selector: 'app-sighting-bird-page',
  standalone: true,
  imports: [FormSighting],
  templateUrl: './sighting-bird-page.html',
  styleUrls: ['./sighting-bird-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SightingBirdPage { }
