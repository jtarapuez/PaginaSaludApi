import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-volver-arriba',
  imports: [],
  templateUrl: './volver-arriba.component.html',
  styleUrl: './volver-arriba.component.scss'
})
export class VolverArribaComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  visible = false;

  private readonly bottomOffset = 120;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateVisibility();
    }
  }

  ngOnDestroy(): void {
    // HostListener se limpia automáticamente al destruir el componente
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.updateVisibility();
  }

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
