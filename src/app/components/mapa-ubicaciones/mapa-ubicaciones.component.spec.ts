import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MapaUbicacionesComponent } from './mapa-ubicaciones.component';
import { UnidadesMedicasService } from '../../core/services/unidades-medicas.service';
import { of } from 'rxjs';

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
  });

  it('should extract provinces from data', () => {
    unidadesMedicasService.getUnidadesMedicas.and.returnValue(of(mockUnidadesMedicas));
    
    component.ngOnInit();
    
    expect(component.provincias).toEqual(['Pichincha']);
  });
}); 