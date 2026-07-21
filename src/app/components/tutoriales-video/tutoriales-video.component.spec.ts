import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorialesVideoComponent } from './tutoriales-video.component';

describe('TutorialesVideoComponent', () => {
  let component: TutorialesVideoComponent;
  let fixture: ComponentFixture<TutorialesVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialesVideoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialesVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build carousel slides', () => {
    expect(component.slides.length).toBeGreaterThan(0);
  });
});
