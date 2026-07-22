import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TutorialVideo } from '../../core/models/tutorial-video.model';

interface BootstrapCarouselEvent extends Event {
  from: number;
  to: number;
}

@Component({
  selector: 'app-tutoriales-video',
  imports: [],
  templateUrl: './tutoriales-video.component.html',
  styleUrl: './tutoriales-video.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TutorialesVideoComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  private modalInstance: { show(): void; hide(): void } | null = null;
  private modalHiddenHandler: (() => void) | null = null;
  private carouselSlidHandler: ((event: Event) => void) | null = null;
  private carouselSlideHandler: ((event: Event) => void) | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private carouselSyncTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly videos: TutorialVideo[] = [
    {
      youtubeId: 'tmJ0BGVRAe0',
      title: 'Agendamiento de citas médicas',
      duration: '1:01',
      thumbnail: 'assets/images/videos/video_agendar_citas.png'
    },
    {
      youtubeId: 'aBXgGkGseMs',
      title: 'Cancelar citas médicas',
      duration: '0:51',
      thumbnail: 'assets/images/videos/video_cancelar_cita.png'
    },
    {
      youtubeId: 'zXJps4O9ciM',
      title: 'Reagendamiento citas médicas',
      duration: '0:55',
      thumbnail: 'assets/images/videos/video_regeandar.png'
    },
    {
      youtubeId: 'LDMPAy5jnBo',
      title: 'Registro de datos',
      duration: '0:58',
      thumbnail: 'assets/images/videos/video_registro_datos.png'
    },
    {
      youtubeId: 'G1pidASs1Sk',
      title: 'Actualización de datos',
      duration: '1:21',
      thumbnail: 'assets/images/videos/video_actualizar_datos.png'
    }
  ];

  slides: TutorialVideo[][] = [];
  itemsPerSlide = 3;
  activeSlideIndex = 0;
  selectedVideoTitle = '';
  safeVideoEmbedUrl: SafeResourceUrl | null = null;

  ngOnInit(): void {
    this.rebuildSlides();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initModal();
    this.scheduleCarouselSync();
    this.bindCarouselEvents();
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    if (this.carouselSyncTimeout) {
      clearTimeout(this.carouselSyncTimeout);
    }

    this.unbindCarouselEvents();

    const modalElement = document.getElementById('tutorialesVideoModal');
    if (modalElement && this.modalHiddenHandler) {
      modalElement.removeEventListener('hidden.bs.modal', this.modalHiddenHandler);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      const currentIndex = this.activeSlideIndex;
      this.rebuildSlides();
      this.cdr.markForCheck();
      this.scheduleCarouselSync(currentIndex);
    }, 300);
  }

  openVideo(video: TutorialVideo): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.selectedVideoTitle = video.title;
    this.safeVideoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`
    );
    this.modalInstance?.show();
    this.cdr.markForCheck();
  }

  private rebuildSlides(): void {
    const previousSlide = this.activeSlideIndex;
    this.itemsPerSlide = this.getItemsPerSlide();
    this.slides = this.chunkVideos(this.videos, this.itemsPerSlide);

    if (this.slides.length === 0) {
      this.activeSlideIndex = 0;
      return;
    }

    this.activeSlideIndex = Math.min(previousSlide, this.slides.length - 1);
  }

  private scheduleCarouselSync(activeIndex?: number): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.carouselSyncTimeout) {
      clearTimeout(this.carouselSyncTimeout);
    }

    this.carouselSyncTimeout = setTimeout(() => {
      this.syncCarouselDom(activeIndex ?? this.activeSlideIndex);
    }, 0);
  }

  /**
   * Igual que Citas_Medicas: Bootstrap controla las clases del carrusel en el DOM.
   * Angular no debe reasignar .active durante la animación.
   */
  private syncCarouselDom(activeIndex: number): void {
    const carouselElement = document.getElementById('tutorialesVideoCarousel');
    const wrap = carouselElement?.closest('.tutoriales-carousel-wrap');
    if (!carouselElement) {
      return;
    }

    const items = carouselElement.querySelectorAll('.carousel-item');
    items.forEach((item, index) => {
      item.classList.toggle('active', index === activeIndex);
      item.classList.remove(
        'carousel-item-next',
        'carousel-item-prev',
        'carousel-item-start',
        'carousel-item-end'
      );
    });

    const indicators = wrap?.querySelectorAll('.carousel-indicators [data-bs-slide-to]') ?? [];
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === activeIndex);
      if (index === activeIndex) {
        indicator.setAttribute('aria-current', 'true');
      } else {
        indicator.removeAttribute('aria-current');
      }
    });
  }

  private bindCarouselEvents(): void {
    const carouselElement = document.getElementById('tutorialesVideoCarousel');
    if (!carouselElement) {
      return;
    }

    this.carouselSlideHandler = (event: Event) => {
      const carouselEvent = event as BootstrapCarouselEvent;
      this.activeSlideIndex = carouselEvent.to;
      this.cdr.markForCheck();
    };

    this.carouselSlidHandler = (event: Event) => {
      const carouselEvent = event as BootstrapCarouselEvent;
      this.activeSlideIndex = carouselEvent.to;
      this.cdr.markForCheck();
    };

    carouselElement.addEventListener('slide.bs.carousel', this.carouselSlideHandler);
    carouselElement.addEventListener('slid.bs.carousel', this.carouselSlidHandler);
  }

  private unbindCarouselEvents(): void {
    const carouselElement = document.getElementById('tutorialesVideoCarousel');
    if (!carouselElement) {
      return;
    }

    if (this.carouselSlideHandler) {
      carouselElement.removeEventListener('slide.bs.carousel', this.carouselSlideHandler);
      this.carouselSlideHandler = null;
    }

    if (this.carouselSlidHandler) {
      carouselElement.removeEventListener('slid.bs.carousel', this.carouselSlidHandler);
      this.carouselSlidHandler = null;
    }
  }

  private getItemsPerSlide(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 3;
    }

    if (window.innerWidth < 768) {
      return 1;
    }

    if (window.innerWidth < 992) {
      return 2;
    }

    return 3;
  }

  private chunkVideos(videos: TutorialVideo[], size: number): TutorialVideo[][] {
    const chunks: TutorialVideo[][] = [];

    for (let index = 0; index < videos.length; index += size) {
      chunks.push(videos.slice(index, index + size));
    }

    return chunks;
  }

  private initModal(): void {
    const modalElement = document.getElementById('tutorialesVideoModal');
    if (!modalElement || typeof bootstrap === 'undefined') {
      return;
    }

    this.modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
    this.modalHiddenHandler = () => {
      this.safeVideoEmbedUrl = null;
      this.cdr.markForCheck();
    };
    modalElement.addEventListener('hidden.bs.modal', this.modalHiddenHandler);
  }
}

declare const bootstrap: {
  Modal: {
    getOrCreateInstance(element: Element): { show(): void; hide(): void };
  };
};
