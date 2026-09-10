/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MapaUbicacionesComponent } from './mapa-ubicaciones.component';
import { UnidadesMedicasService } from '../../core/services/unidades-medicas.service';
import { of, throwError, Subject } from 'rxjs';

describe('MapaUbicacionesComponent', () => {
  let component: MapaUbicacionesComponent;
  let fixture: ComponentFixture<MapaUbicacionesComponent>;
  let unidadesMedicasService: jasmine.SpyObj<UnidadesMedicasService>;

  const mockUnidadesMedicas = [
    {
      provincia: 'Pichincha',
      unidades: [
        {
          nombre: 'Hospital Eugenio Espejo',
          direccion: 'Avenida Colombia y Yaguachi',
          telefono: '02-228-2000',
          nivel: 3,
          latitud: -0.1807,
          longitud: -78.4678,
          descripcion: 'Hospital de tercer nivel',
          sitio_web: 'http://hospital.gob.ec',
          siglas: 'HEE'
        }
      ]
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UnidadesMedicasService', ['getUnidadesMedicas', 'clearCache']);

    await TestBed.configureTestingModule({
      imports: [
        MapaUbicacionesComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: UnidadesMedicasService, useValue: spy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MapaUbicacionesComponent);
    component = fixture.componentInstance;
    unidadesMedicasService = TestBed.inject(UnidadesMedicasService) as jasmine.SpyObj<UnidadesMedicasService>;
  });

  it('should create', () => {
    unidadesMedicasService.getUnidadesMedicas.and.returnValue(of(mockUnidadesMedicas));
    expect(component).toBeTruthy();
  });

  it('should load medical units on init', () => {
    unidadesMedicasService.getUnidadesMedicas.and.returnValue(of(mockUnidadesMedicas));

    component.ngOnInit();

    expect(unidadesMedicasService.getUnidadesMedicas).toHaveBeenCalled();
    expect(component.provinciasUnidades).toEqual(mockUnidadesMedicas);
    expect(component.errorCargaUnidades).toBe('');
  });

  it('should extract provinces from data', () => {
    unidadesMedicasService.getUnidadesMedicas.and.returnValue(of(mockUnidadesMedicas));

    component.ngOnInit();

    expect(component.provincias).toEqual(['Pichincha']);
  });

  it('should set errorCargaUnidades when initial API load fails', () => {
    unidadesMedicasService.getUnidadesMedicas.and.returnValue(
      throwError(() => new Error('network'))
    );

    component.ngOnInit();

    expect(component.errorCargaUnidades).toBe('No se pudieron cargar las unidades médicas.');
    expect(component.filtroAplicado).toBeFalse();
  });

  it('should show initial load error in the DOM without filters applied', () => {
    unidadesMedicasService.getUnidadesMedicas.and.returnValue(
      throwError(() => new Error('network'))
    );

    component.ngOnInit();
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('.error-filtros');
    expect(component.filtroAplicado).toBeFalse();
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('No se pudieron cargar las unidades médicas.');
  });

  it('should not update state after destroy when late emission arrives', () => {
    const late$ = new Subject<typeof mockUnidadesMedicas>();
    unidadesMedicasService.getUnidadesMedicas.and.returnValue(late$.asObservable());

    component.ngOnInit();
    expect(component.provinciasUnidades).toEqual([]);

    fixture.destroy();
    late$.next(mockUnidadesMedicas);

    expect(component.provinciasUnidades).toEqual([]);
  });

  it('should calculate distance between two coordinates', () => {
    const distancia = component.calcularDistancia(-0.1807, -78.4678, -0.2, -78.5);
    expect(distancia).toBeGreaterThan(0);
    expect(distancia).toBeLessThan(50);
  });

  it('should count filtered units', () => {
    component.provinciasFiltradas = mockUnidadesMedicas;
    expect(component.getTotalUnidades()).toBe(1);
  });

  it('should toggle province accordion state', () => {
    component.toggleProvincia('Pichincha');
    expect(component.provinciasExpandidas['Pichincha']).toBeTrue();
    component.toggleProvincia('Pichincha');
    expect(component.provinciasExpandidas['Pichincha']).toBeFalse();
  });

  it('should reset filters on limpiarFiltros', () => {
    unidadesMedicasService.getUnidadesMedicas.and.returnValue(of(mockUnidadesMedicas));
    component.ngOnInit();
    component.provinciaSeleccionada = 'Pichincha';
    component.nivelSeleccionado = 3;
    component.terminoBusqueda = 'hospital';
    component.filtroAplicado = true;

    component.limpiarFiltros();

    expect(component.provinciaSeleccionada).toBe('');
    expect(component.nivelSeleccionado).toBeNull();
    expect(component.terminoBusqueda).toBe('');
    expect(component.filtroAplicado).toBeFalse();
  });

  it('should close Google Maps modal', () => {
    component.mostrarModalGoogleMaps = true;
    component.cerrarModalGoogleMaps();
    expect(component.mostrarModalGoogleMaps).toBeFalse();
  });
});
