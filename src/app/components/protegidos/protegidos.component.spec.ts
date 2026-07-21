import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtegidosComponent } from './protegidos.component';

describe('ProtegidosComponent', () => {
  let component: ProtegidosComponent;
  let fixture: ComponentFixture<ProtegidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtegidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProtegidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
