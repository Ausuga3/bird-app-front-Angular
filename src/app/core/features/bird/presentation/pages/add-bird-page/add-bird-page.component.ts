import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBirdComponent } from "../../components/forms/form-bird/form-bird.component";

@Component({
  selector: 'app-add-bird-page',
  imports: [FormBirdComponent],
  templateUrl: './add-bird-page.component.html',
  styleUrl: './add-bird-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBirdPageComponent { }
