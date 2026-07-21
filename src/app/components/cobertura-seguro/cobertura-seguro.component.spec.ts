import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoberturaSeguroComponent } from './cobertura-seguro.component';

describe('CoberturaSeguroComponent', () => {
  let component: CoberturaSeguroComponent;
  let fixture: ComponentFixture<CoberturaSeguroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoberturaSeguroComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CoberturaSeguroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
