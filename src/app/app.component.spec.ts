/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

class IntersectionObserverMock {
  observe = jasmine.createSpy('observe');
  disconnect = jasmine.createSpy('disconnect');
  unobserve = jasmine.createSpy('unobserve');
}

describe('AppComponent', () => {
  beforeEach(async () => {
    (window as any).IntersectionObserver = IntersectionObserverMock;

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'salud-geolocalizacion-ui' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('salud-geolocalizacion-ui');
  });

  it('should initialize scroll observer and observe fade elements', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const fadeElement = document.createElement('section');
    fadeElement.className = 'fade-in-scroll';
    fixture.nativeElement.appendChild(fadeElement);

    app.ngOnInit();
    app.ngAfterViewInit();

    const observer = (app as any).observer as IntersectionObserverMock;
    expect(observer.observe).toHaveBeenCalled();

    app.ngOnDestroy();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
