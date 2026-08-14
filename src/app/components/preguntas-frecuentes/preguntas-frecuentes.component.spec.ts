import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreguntasFrecuentesComponent } from './preguntas-frecuentes.component';

describe('PreguntasFrecuentesComponent', () => {
  let component: PreguntasFrecuentesComponent;
  let fixture: ComponentFixture<PreguntasFrecuentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreguntasFrecuentesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PreguntasFrecuentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open first question by default', () => {
    expect(component.estaAbierta(0)).toBeTrue();
    expect(component.estaAbierta(1)).toBeFalse();
  });

  it('should toggle questions', () => {
    component.alternar(1);
    expect(component.estaAbierta(1)).toBeTrue();

    component.alternar(1);
    expect(component.estaAbierta(1)).toBeFalse();
  });

  it('should expose FAQ content', () => {
    expect(component.preguntas.length).toBeGreaterThan(0);
    expect(component.sectionTitle).toBe('Preguntas frecuentes');
  });
});
