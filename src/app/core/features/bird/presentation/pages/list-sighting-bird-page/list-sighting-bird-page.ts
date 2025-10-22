import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-list-sighting-bird-page',
  imports: [RouterLink],
  templateUrl: './list-sighting-bird-page.html',
  styleUrl: './list-sighting-bird-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListSightingBirdPage { }
