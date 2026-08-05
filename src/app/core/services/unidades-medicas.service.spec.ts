import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UnidadesMedicasService } from './unidades-medicas.service';
import { environment } from '../../../environments/environment';

describe('UnidadesMedicasService', () => {
  let service: UnidadesMedicasService;
  let httpMock: HttpTestingController;

  const mockData = [
    {
      provincia: 'Pichincha',
      unidades: [{
        nombre: 'Hospital Test',
        nivel: 3,
        latitud: -0.1,
        longitud: -78.4,
        descripcion: 'Test',
        telefono: '02-000-0000',
        sitio_web: 'https://example.com',
        siglas: 'HT',
        direccion: 'Calle Test'
      }]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UnidadesMedicasService]
    });

    service = TestBed.inject(UnidadesMedicasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch units without filters and cache the response', () => {
    service.getUnidadesMedicas().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(environment.unidadesMedicasDataUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockData);

    service.getUnidadesMedicas().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    httpMock.expectNone(environment.unidadesMedicasDataUrl);
  });

  it('should send filter params when provided', () => {
    service.getUnidadesMedicas({ provincia: 'Pichincha', nivel: 3, q: 'hospital' }).subscribe();

    const req = httpMock.expectOne((request) => request.url === environment.unidadesMedicasDataUrl);
    expect(req.request.params.get('provincia')).toBe('Pichincha');
    expect(req.request.params.get('nivel')).toBe('3');
    expect(req.request.params.get('q')).toBe('hospital');
    req.flush(mockData);
  });

  it('should clear cache', () => {
    service.getUnidadesMedicas().subscribe();
    httpMock.expectOne(environment.unidadesMedicasDataUrl).flush(mockData);

    service.clearCache();

    service.getUnidadesMedicas().subscribe();
    httpMock.expectOne(environment.unidadesMedicasDataUrl).flush(mockData);
  });
});
