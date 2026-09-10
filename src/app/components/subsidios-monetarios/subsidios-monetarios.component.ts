/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { Component } from '@angular/core';

/**
 * Información de subsidios monetarios por enfermedad y maternidad.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
@Component({
  selector: 'app-subsidios-monetarios',
  imports: [],
  templateUrl: './subsidios-monetarios.component.html',
  styleUrl: './subsidios-monetarios.component.scss'
})
export class SubsidiosMonetariosComponent {
  readonly sectionTitle = 'Subsidios monetarios';
  readonly accordionTitle = 'Tipos de Subsidios Monetarios';

  readonly introParagraphs = [
    'Los subsidios monetarios son prestaciones económicas que ofrece el IESS a los afiliados que se encuentran imposibilitados para trabajar debido a una enfermedad o maternidad.',
    'Este subsidio se paga a partir del cuarto día de incapacidad hasta un máximo de seis meses y, en el caso de maternidad, desde el primer día hasta 84 días.'
  ];

  readonly tiposSubsidio = [
    'Subsidios Monetarios por Enfermedad General',
    'Subsidios Monetarios por Maternidad.'
  ];

  accordionAbierto = false;

  /**
   * Abre o cierra el acordeón de tipos de subsidio.
   */
  toggleAccordion(): void {
    this.accordionAbierto = !this.accordionAbierto;
  }
}
