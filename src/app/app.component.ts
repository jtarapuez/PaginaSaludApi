import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BannerComponent } from './components/banner/banner.component';
import { ProtegidosComponent } from './components/protegidos/protegidos.component';
import { AgendamientoComponent } from './components/agendamiento/agendamiento.component';
import { MapaUbicacionesComponent } from './components/mapa-ubicaciones/mapa-ubicaciones.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, BannerComponent, ProtegidosComponent, AgendamientoComponent, MapaUbicacionesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'PaginaSalud';
  private observer!: IntersectionObserver;

  ngOnInit() {
    this.initScrollAnimations();
  }

  ngAfterViewInit() {
    this.observeElements();
  }

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
    // Observar elementos que deben tener efecto fade
    const elementsToObserve = document.querySelectorAll('.fade-in-scroll, .fade-in-left, .fade-in-right, .fade-in-up, .fade-in-scale');
    elementsToObserve.forEach(el => this.observer.observe(el));
  }
}
