import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  ngOnInit() {
    // Funcionalidad para cerrar el menú al hacer clic en enlaces en móvil
    this.initNavbarToggle();
  }

  private initNavbarToggle() {
    // Esperar a que el DOM esté listo
    setTimeout(() => {
      const navbarToggler = document.querySelector('.navbar-toggler') as HTMLElement;
      const navbarCollapse = document.querySelector('#navbarNav') as HTMLElement;
      const navLinks = document.querySelectorAll('.nav-link');
      const dropdownItems = document.querySelectorAll('.dropdown-item');

      // Función para cerrar el menú
      const closeMenu = () => {
        if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
          if (navbarCollapse?.classList.contains('show')) {
            // Usar Bootstrap nativo si está disponible
            if ((window as any).bootstrap) {
              const bootstrapCollapse = new (window as any).bootstrap.Collapse(navbarCollapse, {
                toggle: false
              });
              bootstrapCollapse.hide();
            } else {
              // Fallback manual
              navbarCollapse.classList.remove('show');
              navbarToggler.setAttribute('aria-expanded', 'false');
            }
          }
        }
      };

      // Agregar event listeners a todos los enlaces del menú
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          // No cerrar si es un dropdown toggle
          if (!link.getAttribute('data-bs-toggle')) {
            closeMenu();
          }
        });
      });

      // Agregar event listeners a los elementos del dropdown
      dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
          closeMenu();
        });
      });

      // Cerrar menú al hacer clic fuera
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!navbarCollapse?.contains(target) && !navbarToggler?.contains(target)) {
          if (navbarCollapse?.classList.contains('show')) {
            closeMenu();
          }
        }
      });
    }, 200);
  }
}
