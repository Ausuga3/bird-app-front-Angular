import { Component } from '@angular/core';
import { TableBirdComponent } from "../../../../bird/presentation/components/list-birds/table-bird/table-bird.component";
import { ListSighting } from "../../../../sighting/presentation/pages/list-sigthing-page/list-sigthing-page";

@Component({
  selector: 'app-admin',
  imports: [TableBirdComponent, ListSighting],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  
})
export class Admin { }
