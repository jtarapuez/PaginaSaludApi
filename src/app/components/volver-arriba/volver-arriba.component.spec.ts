import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VolverArribaComponent } from './volver-arriba.component';

describe('VolverArribaComponent', () => {
  let component: VolverArribaComponent;
  let fixture: ComponentFixture<VolverArribaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolverArribaComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VolverArribaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle visibility on viewport change', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 1100
    });

    component.onViewportChange();

    expect(component.visible).toBeTrue();
  });

  it('should scroll to inicioPagina when present', () => {
    const scrollIntoView = jasmine.createSpy('scrollIntoView');
    const elemento = document.createElement('div');
    elemento.id = 'inicioPagina';
    elemento.scrollIntoView = scrollIntoView;
    spyOn(document, 'getElementById').and.returnValue(elemento);

    component.volverAlInicio();

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });
});
