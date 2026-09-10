/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import {
  Component,
  HostListener,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Botón para volver al inicio de la página.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
@Component({
  selector: 'app-volver-arriba',
  imports: [],
  templateUrl: './volver-arriba.component.html',
  styleUrl: './volver-arriba.component.scss'
})
export class VolverArribaComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  visible = false;

  private readonly bottomOffset = 120;

  /**
   * Calcula si el botón debe mostrarse según el scroll.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateVisibility();
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  /**
   * Actualiza la visibilidad del botón al hacer scroll o resize.
   */
  onViewportChange(): void {
    this.updateVisibility();
  }

  /**
   * Desplaza la vista al inicio de la página.
   */
  volverAlInicio(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const inicio = document.getElementById('inicioPagina');

    if (inicio) {
      inicio.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateVisibility(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    this.visible = scrollTop + viewportHeight >= documentHeight - this.bottomOffset;
  }
}
