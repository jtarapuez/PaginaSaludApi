import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnidadesMedicasComponent } from './unidades-medicas.component';

describe('UnidadesMedicasComponent', () => {
  let component: UnidadesMedicasComponent;
  let fixture: ComponentFixture<UnidadesMedicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidadesMedicasComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UnidadesMedicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose 102 total units', () => {
    expect(component.totalUnidades).toBe(102);
    expect(component.niveles.length).toBe(3);
  });
});
