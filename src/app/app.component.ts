/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BannerComponent } from './components/banner/banner.component';
import { TutorialesVideoComponent } from './components/tutoriales-video/tutoriales-video.component';
import { CoberturaSeguroComponent } from './components/cobertura-seguro/cobertura-seguro.component';
import { UnidadesMedicasComponent } from './components/unidades-medicas/unidades-medicas.component';
import { MapaUbicacionesComponent } from './components/mapa-ubicaciones/mapa-ubicaciones.component';
import { SubsidiosMonetariosComponent } from './components/subsidios-monetarios/subsidios-monetarios.component';
import { RequisitosSubsidioComponent } from './components/requisitos-subsidio/requisitos-subsidio.component';
import { ExtensionCoberturaComponent } from './components/extension-cobertura/extension-cobertura.component';
import { PreguntasFrecuentesComponent } from './components/preguntas-frecuentes/preguntas-frecuentes.component';
import { VolverArribaComponent } from './components/volver-arriba/volver-arriba.component';
import { ComoValidarComponent } from './components/como-validar/como-validar.component';

/**
 * Componente raíz de la landing de Salud IESS.
 *
 * @author Juan Pablo Tarapuez
 * @version Revision: 1.0
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    BannerComponent,
    TutorialesVideoComponent,
    CoberturaSeguroComponent,
    UnidadesMedicasComponent,
    MapaUbicacionesComponent,
    SubsidiosMonetariosComponent,
    RequisitosSubsidioComponent,
    ComoValidarComponent,
    ExtensionCoberturaComponent,
    PreguntasFrecuentesComponent,
    VolverArribaComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'salud-geolocalizacion-ui';
  private observer!: IntersectionObserver;

  /**
   * Inicializa las animaciones de scroll.
   */
  ngOnInit() {
    this.initScrollAnimations();
  }

  /**
   * Observa elementos visibles tras el render de componentes hijos.
   */
  ngAfterViewInit() {
    this.observeElements();
    // Re-escanea tras el render completo de componentes hijos
    setTimeout(() => this.observeElements(), 0);
  }

  /**
   * Libera el IntersectionObserver.
   */
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private initScrollAnimations() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
        } else {
          entry.target.classList.remove('fade-in-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
  }

  private observeElements() {
    const elementsToObserve = document.querySelectorAll(
      '.fade-in-scroll, .fade-in-left, .fade-in-right, .fade-in-up, .fade-in-scale'
    );
    elementsToObserve.forEach(el => {
      const element = el as HTMLElement;
      if (element.dataset['fadeObserved'] === 'true') {
        return;
      }
      element.dataset['fadeObserved'] = 'true';
      this.observer.observe(el);
    });
  }
}
