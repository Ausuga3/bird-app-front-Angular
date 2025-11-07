import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SightingDetails } from '../../components/sighting-details/sighting-details';

@Component({
  selector: 'app-details-sightings-page',
  standalone: true,
  imports: [SightingDetails],
  templateUrl: './details-sightings-page.html',
  styleUrl: './details-sightings-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsSightingsPage { }
