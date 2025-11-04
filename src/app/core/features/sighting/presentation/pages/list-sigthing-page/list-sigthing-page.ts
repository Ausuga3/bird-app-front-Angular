import { Component } from "@angular/core";
import { SightingList } from "../../components/sighting-list/sighting-list";


@Component({
  selector: 'app-list-sighting',
  standalone: true,
  imports: [SightingList],
  templateUrl: 'list-sigthing-page.html',

})
export class ListSighting{ 
  
}