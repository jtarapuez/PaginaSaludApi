import { Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  readonly beneficiariosProtegidos = [
    'Afiliados del régimen obligatorio y voluntario',
    'Hijos de afiliados hasta los 18 años',
    'Pensionistas de invalidez, vejez y viudedad',
    'Montepío por orfandad hasta los 18 años',
    'Pensionista de incapacidad permanente, parcial, total y absoluta de Riesgos del Trabajo',
    'El cónyuge o conviviente con derecho'
  ];
}
