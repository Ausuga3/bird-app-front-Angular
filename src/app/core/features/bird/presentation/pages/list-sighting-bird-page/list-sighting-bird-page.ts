import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ListSighting } from "../../components/list-sighting/list-sighting";

@Component({
  selector: 'app-list-sighting-bird-page',
  imports: [ListSighting],
  templateUrl: './list-sighting-bird-page.html',
  styleUrl: './list-sighting-bird-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListSightingBirdPage { }
