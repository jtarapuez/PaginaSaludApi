import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubsidiosMonetariosComponent } from './subsidios-monetarios.component';

describe('SubsidiosMonetariosComponent', () => {
  let component: SubsidiosMonetariosComponent;
  let fixture: ComponentFixture<SubsidiosMonetariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsidiosMonetariosComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SubsidiosMonetariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle accordion', () => {
    expect(component.accordionAbierto).toBeFalse();
    component.toggleAccordion();
    expect(component.accordionAbierto).toBeTrue();
  });
});
