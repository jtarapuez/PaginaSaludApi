import { Component } from '@angular/core';

interface NivelUnidadMedica {
  nivel: string;
  cantidad: number;
}

@Component({
  selector: 'app-unidades-medicas',
  imports: [],
  templateUrl: './unidades-medicas.component.html',
  styleUrl: './unidades-medicas.component.scss'
})
export class UnidadesMedicasComponent {
  readonly totalUnidades = 102;

  readonly niveles: NivelUnidadMedica[] = [
    { nivel: 'Primer nivel', cantidad: 46 },
    { nivel: 'Segundo nivel', cantidad: 53 },
    { nivel: 'Tercer nivel', cantidad: 3 }
  ];
}
