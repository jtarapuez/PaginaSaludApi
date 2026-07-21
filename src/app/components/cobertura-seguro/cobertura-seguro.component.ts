import { Component } from '@angular/core';

@Component({
  selector: 'app-cobertura-seguro',
  imports: [],
  templateUrl: './cobertura-seguro.component.html',
  styleUrl: './cobertura-seguro.component.scss'
})
export class CoberturaSeguroComponent {
  readonly sectionTitle = '¿Qué cubre el Seguro de Salud?';
  readonly sectionSummary =
    'Promoción de la salud, prevención, diagnóstico y tratamiento de enfermedades no profesionales, rehabilitación y recuperación de la salud.';

  readonly derechosAfiliado = [
    'Asistencia médica integral',
    'Exámenes de diagnóstico',
    'Atención médica clínica',
    'Asistencia quirúrgica',
    'Rehabilitación',
    'Dotación de implementos farmacéuticos',
    'Subsidio monetario cuando la enfermedad produce incapacidad en el trabajo'
  ];
}
