/**
 * Copyright 2026 INSTITUTO ECUATORIANO DE SEGURIDAD SOCIAL - ECUADOR.
 * Todos los derechos reservados.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendamientoComponent } from './agendamiento.component';

describe('AgendamientoComponent', () => {
  let component: AgendamientoComponent;
  let fixture: ComponentFixture<AgendamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendamientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
