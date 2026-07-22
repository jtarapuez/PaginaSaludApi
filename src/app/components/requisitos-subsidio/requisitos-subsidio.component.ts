import { Component } from '@angular/core';

@Component({
  selector: 'app-requisitos-subsidio',
  imports: [],
  templateUrl: './requisitos-subsidio.component.html',
  styleUrl: './requisitos-subsidio.component.scss'
})
export class RequisitosSubsidioComponent {
  readonly sectionTitle = 'Requisitos';

  readonly requisitos = [
    'Tener seis meses de aportación continua anterior al inicio de la enfermedad y por maternidad 12 aportes continuos.',
    'Contar con un certificado médico de reposo emitido por el médico tratante o validado por la entidad.',
    'Registrar una cuenta bancaria activa para efectuar el depósito del subsidio otorgado por el IESS.'
  ];
}
