import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableBirdComponent } from '../../components/list-birds/table-bird/table-bird.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-bird-page',
  standalone: true,
  imports: [CommonModule, TableBirdComponent],
  templateUrl: './list-bird-page.component.html',
  styleUrl: './list-bird-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListBirdPageComponent { }
