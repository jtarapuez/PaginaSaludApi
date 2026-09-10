/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { Component } from '@angular/core';

/**
 * Sección de cobertura del Seguro de Salud.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
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
