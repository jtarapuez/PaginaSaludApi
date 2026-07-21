# Arquitectura — PaginaSalud (IESS Salud)

Análisis técnico del proyecto para desarrollo y mantenimiento.

**Última actualización:** junio 2025  
**Angular:** 19.2 | **TypeScript:** 5.7

---

## 1. Visión general

Landing page institucional del IESS con:

- Secciones informativas (banner, protegidos, agendamiento)
- Mapa interactivo de unidades médicas (Leaflet)
- Geolocalización del usuario y filtros por provincia/nivel
- Navegación por anclas en menú fijo

No hay autenticación, estado global ni API REST activa. Los datos vienen de JSON estático.

---

## 2. Diagrama de componentes

```
main.ts
  └── bootstrapApplication(AppComponent, appConfig)
        │
        ├── NavbarComponent          (menú fijo, Bootstrap)
        ├── BannerComponent          (#inicioPagina)
        ├── ProtegidosComponent      (#montos, #video)
        ├── AgendamientoComponent    (CTA citas)
        ├── MapaUbicacionesComponent (#titulo-mapa) ──► UnidadesMedicasService
        └── RouterOutlet             (sin rutas activas)
```

### app.config.ts — providers

```typescript
provideZoneChangeDetection({ eventCoalescing: true })
provideRouter(routes)                    // routes = []
provideClientHydration(withEventReplay())
provideHttpClient(withInterceptorsFromDi())
```

---

## 3. Capa Core

### Modelos (`src/app/core/models/`)

```typescript
interface UnidadMedica {
  nombre, nivel, latitud, longitud, descripcion,
  telefono, sitio_web, siglas, direccion
}

interface ProvinciaUnidades {
  provincia: string;
  unidades: UnidadMedica[];
}
```

### Servicios (`src/app/core/services/`)

**UnidadesMedicasService**

- `providedIn: 'root'`
- `getUnidadesMedicas()` → HTTP GET + `shareReplay(1)`
- URL hardcodeada: `assets/data/unidades-medicas.json`
- `clearCache()` para invalidar

**Pendiente:** usar `environment.unidadesMedicasDataUrl` y abstraer detrás de un repositorio para API futura.

---

## 4. Componentes

### AppComponent

- Compone todas las secciones
- `IntersectionObserver` para animaciones en elementos `.fade-in-*`
- Limpia observer en `ngOnDestroy`
- Referencia `styleUrl: './app.component.scss'` — archivo ausente

### NavbarComponent

- Menú Bootstrap con dropdown de afiliación
- Toggle y cierre de menú vía `document.querySelector` + `setTimeout(200)`
- Depende de Bootstrap JS (CDN en `index.html`)
- Sin `OnDestroy` — listeners no se remueven

### BannerComponent, ProtegidosComponent, AgendamientoComponent

- Presentacionales puros
- SCSS de componente vacío; estilos en `src/assets/styles/_*.scss`
- Archivos `.css` huérfanos en algunas carpetas

### MapaUbicacionesComponent (~540 líneas)

**Responsabilidades:**

- Cargar provincias/unidades vía servicio
- Inicializar mapa Leaflet (centro Ecuador, zoom 7)
- Marcadores personalizados (`src/assets/images/leaflet/`)
- Filtros: búsqueda, provincia, nivel (`ngModel`)
- Geolocalización del navegador
- Enlaces a Google Maps para rutas
- Popups con datos de cada unidad

**Dependencias:** `CommonModule`, `FormsModule`, Leaflet (`import * as L`)

**Gaps:** sin `OnDestroy` para mapa; código muerto (`rutaLayer`, `toggleMapa`); logs no condicionados a `environment.enableConsoleLogging`

---

## 5. Estilos

### Jerarquía

```
src/styles.scss
  ├── _variables.scss      (colores, breakpoints, fuentes)
  ├── _fonts.scss          (@font-face Poppins)
  ├── bootstrap/scss       (import npm)
  ├── _navbar.scss
  ├── _banner.scss
  ├── _protegidos.scss
  ├── _agendamiento.scss
  ├── estilo.scss          (~1200 líneas, estilos legacy)
  └── utilidades globales  (fade-in, custom-container, responsive)
```

### Convención actual

| Tipo | Ubicación |
|------|-----------|
| Tokens / fuentes | `src/assets/styles/_variables.scss`, `_fonts.scss` |
| Sección estática | Parcial global `_nombre.scss` |
| Mapa | `mapa-ubicaciones.component.scss` |

### Bootstrap — triple carga

1. CDN CSS/JS en `src/index.html`
2. `@use 'bootstrap/scss/bootstrap'` en `styles.scss`
3. Clases en templates

**Recomendación:** unificar en npm únicamente.

---

## 6. Assets

| Ruta | Contenido |
|------|-----------|
| `src/assets/data/unidades-medicas.json` | ~1258 líneas, datos del mapa |
| `src/assets/fonts/Poppins-*.ttf` | Tipografía |
| `src/assets/images/logo.png`, `img_doctora.png`, etc. | UI |
| `src/assets/images/bot_*_on/off.png` | Bots afiliación (sin usar en HTML) |
| `src/assets/images/leaflet/` | Iconos mapa |

La carpeta `/assets/` en raíz del proyecto está en `.gitignore` (duplicado de `src/assets/`).

---

## 7. Ambientes y build

### Archivos

- `src/environments/environment.ts` — desarrollo (default)
- `src/environments/environment.staging.ts`
- `src/environments/environment.production.ts`

Cada uno define: `apiUrl`, `mapConfig`, `unidadesMedicasDataUrl`, flags (`enableConsoleLogging`, `enableAnalytics`), `appTitle`.

### angular.json

| Config | fileReplacements | Uso |
|--------|------------------|-----|
| development | ninguno | default serve/build |
| staging | → environment.staging.ts | pruebas |
| production | → environment.production.ts | prod |

**Problema:** ningún `.ts` de la app importa `environment` todavía.

### SSR (incompleto)

Existen `main.server.ts`, `server.ts`, `app.config.server.ts` pero `angular.json` usa builder `browser`, no application/SSR. `provideClientHydration` está activo sin pipeline SSR completo.

---

## 8. Dependencias

### Producción

| Paquete | Uso |
|---------|-----|
| @angular/* 19.2 | Framework |
| bootstrap 5.3 + @popperjs/core | UI |
| leaflet 1.9 | Mapas |
| @fortawesome/fontawesome-free | Iconos |
| rxjs 7.8 | Observables |
| express 4.18 | Servidor SSR (no activo en build) |
| @angular/ssr | Hidratación parcial |

### Ausencias notables

NgRx, Angular Material, i18n, E2E (Cypress/Playwright), cliente API tipado.

---

## 9. Testing

- **Runner:** Karma + Jasmine (`ng test`)
- **Cobertura:** smoke tests en mayoría; mapa tiene tests de carga de datos con mock del servicio
- **Sin tests:** servicio HTTP, filtros mapa, geolocalización, E2E

---

## 10. Navegación y anclas

### Implementadas

| ID | Componente |
|----|------------|
| `inicioPagina` | banner |
| `montos` | protegidos |
| `video` | protegidos |
| `titulo-mapa` | mapa-ubicaciones |

### Pendientes (navbar ya las referencia)

`servicios`, `jovenVoluntario`, `voluntarioIndependiente`, `gestoresCulturales`, `trabajoNoRemuneradoHogar`, `voluntarioExterior`, `preguntasFrecuentes`

---

## 11. Roadmap técnico sugerido

### Alta prioridad

1. Implementar secciones faltantes del navbar
2. Conectar `environment` en servicio y mapa
3. Añadir `id` coherentes con menú en cada nueva sección

### Media prioridad

4. Unificar Bootstrap (quitar CDN)
5. Unificar Leaflet (global script vs import)
6. Crear `app.component.scss` o quitar referencia
7. `OnDestroy` en navbar y mapa
8. Scripts npm: `build:staging`, `build:prod`

### Baja prioridad

9. Decidir SSR: completar o eliminar archivos
10. Mover estilos a SCSS por componente
11. Repositorio abstracto para datos
12. E2E y más unit tests
13. `index.html` → `lang="es"`, título dinámico

---

## 12. Estructura propuesta para nuevas secciones

```
src/app/components/
├── servicios-en-linea/       → #servicios
├── afiliacion-joven/         → #jovenVoluntario
├── afiliacion-voluntario/    → #voluntarioIndependiente
├── gestores-culturales/      → #gestoresCulturales
├── trabajo-hogar/            → #trabajoNoRemuneradoHogar
├── afiliado-exterior/        → #voluntarioExterior
└── preguntas-frecuentes/     → #preguntasFrecuentes
```

Registrar en `app.component.ts` y `app.component.html` respetando el orden del menú.

---

## 13. Evolución de datos (futuro)

```
[Hoy]     JSON estático → UnidadesMedicasService → MapaUbicacionesComponent
[Futuro]  API REST IESS → Repository interface → Service → Componente
```

Los `environment.*.ts` ya tienen `apiUrl` y TODOs para este cambio.

---

## 14. Documentación del mapa

Para el desarrollo completo del componente Leaflet (inicialización, marcadores, geolocalización, filtros, deuda técnica y guía de modificación), ver **[MAPA-UBICACIONES.md](MAPA-UBICACIONES.md)**.
