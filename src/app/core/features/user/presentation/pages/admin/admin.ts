import { Component } from '@angular/core';
import { TableBirdComponent } from "../../../../bird/presentation/components/list-birds/table-bird/table-bird.component";
import { ListSighting } from "../../../../sighting/presentation/pages/list-sigthing-page/list-sigthing-page";
import { UserList } from "../../components/admin/user-list/user-list";

@Component({
  selector: 'app-admin',
  imports: [TableBirdComponent, ListSighting, UserList],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  
})
export class Admin { }
