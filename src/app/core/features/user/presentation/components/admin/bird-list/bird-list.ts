import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bird-list',
  imports: [],
  templateUrl: './bird-list.html',
  styleUrl: './bird-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirdList { }
