import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let container: HTMLDivElement;

  beforeEach(async () => {
    container = document.createElement('div');
    container.innerHTML = `
      <button class="navbar-toggler" aria-expanded="true"></button>
      <div id="navbarNav" class="collapse show">
        <a class="nav-link" href="#inicio">Inicio</a>
        <a class="nav-link" data-bs-toggle="dropdown" href="#">Menu</a>
        <a class="dropdown-item" href="#faq">FAQ</a>
      </div>
    `;
    document.body.appendChild(container);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    container.remove();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize navbar toggle listeners', fakeAsync(() => {
    component.ngOnInit();
    tick(250);

    const navbarCollapse = document.querySelector('#navbarNav') as HTMLElement;
    const navLink = document.querySelector('.nav-link:not([data-bs-toggle])') as HTMLElement;

    expect(navbarCollapse.classList.contains('show')).toBeTrue();
    navLink.click();
    expect(navbarCollapse.classList.contains('show')).toBeFalse();
  }));

  it('should close menu from dropdown item click', fakeAsync(() => {
    component.ngOnInit();
    tick(250);

    const navbarCollapse = document.querySelector('#navbarNav') as HTMLElement;
    const dropdownItem = document.querySelector('.dropdown-item') as HTMLElement;

    dropdownItem.click();
    expect(navbarCollapse.classList.contains('show')).toBeFalse();
  }));
});
