import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MiPerfil } from "../../components/mi-perfil/mi-perfil";

@Component({
  selector: 'app-mi-perfil-page',
  imports: [MiPerfil],
  templateUrl:'mi-perfil-page.html',
  styleUrls: ['mi-perfil-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MiPerfilPage { }
