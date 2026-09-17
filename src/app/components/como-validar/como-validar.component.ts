/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { Component } from '@angular/core';

interface TarjetaInformativa {
  titulo: string;
  imagen: string;
  variante: 'clara' | 'azul';
}

/**
 * Tarjetas informativas (certificado médico y subsidio de maternidad).
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
@Component({
  selector: 'app-como-validar',
  imports: [],
  templateUrl: './como-validar.component.html',
  styleUrl: './como-validar.component.scss'
})
export class ComoValidarComponent {
  readonly tarjetas: TarjetaInformativa[] = [
    {
      titulo: '¿Cómo validar un certificado médico?',
      imagen: 'assets/images/img_validacion_certificado.png',
      variante: 'clara'
    },
    {
      titulo: 'Todo lo que debe saber sobre el subsidio de maternidad',
      imagen: 'assets/images/img_subsisio_maternidad.png',
      variante: 'azul'
    }
  ];
}
