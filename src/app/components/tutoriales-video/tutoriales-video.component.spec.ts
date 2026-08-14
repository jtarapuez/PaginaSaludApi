import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TutorialesVideoComponent } from './tutoriales-video.component';

describe('TutorialesVideoComponent', () => {
  let component: TutorialesVideoComponent;
  let fixture: ComponentFixture<TutorialesVideoComponent>;
  let container: HTMLDivElement;
  let modalShow: jasmine.Spy;

  beforeEach(async () => {
    container = document.createElement('div');
    container.innerHTML = `
      <div id="tutorialesVideoCarousel">
        <div class="carousel-item active"></div>
        <div class="carousel-item"></div>
      </div>
      <div class="tutoriales-carousel-wrap">
        <div class="carousel-indicators">
          <button data-bs-slide-to="0" class="active" aria-current="true"></button>
          <button data-bs-slide-to="1"></button>
        </div>
      </div>
      <div id="tutorialesVideoModal"></div>
    `;
    document.body.appendChild(container);

    modalShow = jasmine.createSpy('show');
    (window as any).bootstrap = {
      Modal: {
        getOrCreateInstance: () => ({ show: modalShow, hide: () => undefined })
      }
    };

    await TestBed.configureTestingModule({
      imports: [TutorialesVideoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialesVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    container.remove();
    delete (window as any).bootstrap;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build carousel slides', () => {
    expect(component.slides.length).toBeGreaterThan(0);
    expect(component.videos.length).toBe(5);
  });

  it('should open selected video in modal', () => {
    component.openVideo(component.videos[0]);

    expect(component.selectedVideoTitle).toBe(component.videos[0].title);
    expect(component.safeVideoEmbedUrl).toBeTruthy();
    expect(modalShow).toHaveBeenCalled();
  });

  it('should rebuild slides on resize', fakeAsync(() => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
    component.onResize();
    tick(350);

    expect(component.itemsPerSlide).toBe(1);
    expect(component.slides.length).toBeGreaterThan(0);
  }));

  it('should sync carousel dom on after view init', fakeAsync(() => {
    component.ngAfterViewInit();
    tick(10);

    const items = document.querySelectorAll('#tutorialesVideoCarousel .carousel-item');
    expect(items[0].classList.contains('active')).toBeTrue();
    expect(items[1].classList.contains('active')).toBeFalse();
  }));

  it('should update active slide on carousel events', () => {
    component.ngAfterViewInit();

    const carouselElement = document.getElementById('tutorialesVideoCarousel') as HTMLElement;
    const slideEvent = new Event('slide.bs.carousel') as Event & { from: number; to: number };
    slideEvent.from = 0;
    slideEvent.to = 1;
    carouselElement.dispatchEvent(slideEvent);

    expect(component.activeSlideIndex).toBe(1);
  });

  it('should clear embed url when modal hides', () => {
    component.ngAfterViewInit();
    component.openVideo(component.videos[1]);

    const modalElement = document.getElementById('tutorialesVideoModal') as HTMLElement;
    modalElement.dispatchEvent(new Event('hidden.bs.modal'));

    expect(component.safeVideoEmbedUrl).toBeNull();
  });

  it('should cleanup listeners on destroy', () => {
    component.ngAfterViewInit();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
