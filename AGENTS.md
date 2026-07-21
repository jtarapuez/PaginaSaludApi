# Guía para agentes — PaginaSalud / GeolocalizacionSalud

Documento de onboarding para agentes de Cursor que trabajen en este repositorio.

## Identidad del proyecto

| Campo | Valor |
|-------|-------|
| Nombre local | PaginaSalud |
| Repositorio GitHub | https://github.com/jtarapuez/GeolocalizacionSalud |
| Rama principal | `main` |
| Cliente | IESS — página de salud pública |
| Stack | Angular 19, SCSS, Bootstrap 5, Leaflet, RxJS |

## Antes de codificar

1. Leer [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) para entender estructura y deuda técnica.
2. Leer [GUIA-AMBIENTES.md](GUIA-AMBIENTES.md) si el cambio afecta builds o despliegue.
3. Revisar componentes existentes y **replicar convenciones** (standalone, nombres, estilos globales).
4. No commitear ni hacer push salvo petición explícita del usuario.
5. Para subir a GitHub, usar el skill `.cursor/skills/git-geolocalizacion-salud/`.

## Comandos esenciales

```bash
npm install          # Primera vez
npm start            # Dev en http://localhost:4200
ng test              # Tests Karma/Jasmine
ng build             # Build desarrollo (default)
ng build --configuration staging
ng build --configuration production
./scripts/ambiente.sh desarrollo   # Atajo ambientes
```

## Estructura resumida

```
src/app/
├── app.component.*       # Shell: compone todas las secciones
├── app.config.ts         # Providers (router, http, hydration)
├── app.routes.ts         # Vacío — rutas futuras
├── components/           # Secciones de la landing
│   ├── navbar/
│   ├── banner/
│   ├── protegidos/
│   ├── agendamiento/
│   └── mapa-ubicaciones/ # Única sección con lógica compleja
└── core/
    ├── models/
    └── services/         # UnidadesMedicasService
```

## Patrones del proyecto

- **Standalone components** — sin NgModules.
- **SPA de una página** — secciones en `app.component.html`, navegación por anclas `#id`.
- **Sin @Input/@Output** entre secciones — cada componente es autónomo.
- **Datos** — JSON estático en `src/assets/data/unidades-medicas.json`.
- **Estilos** — mayoría en `src/assets/styles/_*.scss` importados desde `styles.scss`; mapa usa SCSS de componente.
- **Animaciones scroll** — clases `fade-in-*` observadas por `AppComponent` vía `IntersectionObserver`.

## Secciones implementadas vs pendientes

| Ancla navbar | Componente | Estado |
|--------------|------------|--------|
| `#inicioPagina` | `banner` | ✅ |
| `#montos` | `protegidos` | ✅ |
| `#video` | `protegidos` | ✅ |
| `#titulo-mapa` | `mapa-ubicaciones` | ✅ |
| `#servicios` | — | ❌ Pendiente |
| `#jovenVoluntario` | — | ❌ Pendiente |
| `#voluntarioIndependiente` | — | ❌ Pendiente |
| `#gestoresCulturales` | — | ❌ Pendiente |
| `#trabajoNoRemuneradoHogar` | — | ❌ Pendiente |
| `#voluntarioExterior` | — | ❌ Pendiente |
| `#preguntasFrecuentes` | — | ❌ Pendiente |

Imágenes `src/assets/images/bot_*.png` ya existen para modalidades de afiliación.

## Reglas al agregar nuevas secciones

1. Crear carpeta en `src/app/components/nombre-seccion/`.
2. Componente standalone con `.ts`, `.html`, `.scss`, `.spec.ts`.
3. Añadir `id` en HTML que coincida con el enlace del navbar.
4. Registrar en `app.component.ts` (imports) y `app.component.html` (orden visual).
5. Crear parcial SCSS en `src/assets/styles/_nombre.scss` e importar en `styles.scss` si sigue el patrón actual.
6. Aplicar clases `fade-in-left`, `fade-in-right`, etc. si la sección debe animarse.

## Deuda técnica conocida (no romper sin acordar)

- `environment.ts` existe pero **no se usa** en servicios/componentes.
- Bootstrap cargado por CDN (`index.html`) y por SCSS (`styles.scss`).
- Leaflet cargado global (`angular.json`) y por import ES en el mapa.
- `app.component.scss` referenciado pero el archivo no existe.
- SSR parcial (`@angular/ssr`) sin target de build configurado.
- `NavbarComponent` usa DOM imperativo sin `OnDestroy`.
- Archivos `.css` huérfanos junto a componentes (usar `.scss`).

## Archivos clave

| Propósito | Ruta |
|-----------|------|
| Layout raíz | `src/app/app.component.html` |
| Mapa + geolocalización | `src/app/components/mapa-ubicaciones/` |
| **Documentación del mapa** | `docs/MAPA-UBICACIONES.md` |
| Servicio de datos | `src/app/core/services/unidades-medicas.service.ts` |
| Modelos | `src/app/core/models/unidades-medicas.model.ts` |
| Datos unidades médicas | `src/assets/data/unidades-medicas.json` |
| Variables SCSS | `src/assets/styles/_variables.scss` |
| Ambientes | `src/environments/environment*.ts` |
| Build | `angular.json` |

## Git

- Remoto: `https://github.com/jtarapuez/GeolocalizacionSalud.git`
- No modificar `git config`.
- No force-push a `main` sin autorización.
- `.gitignore` ignora `/assets/` en raíz (canónico: `src/assets/`).

## Documentación relacionada

- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) — análisis técnico detallado
- [docs/MAPA-UBICACIONES.md](docs/MAPA-UBICACIONES.md) — desarrollo completo del mapa Leaflet
- [GUIA-AMBIENTES.md](GUIA-AMBIENTES.md) — dev / staging / producción
- [.cursor/skills/git-geolocalizacion-salud/SKILL.md](.cursor/skills/git-geolocalizacion-salud/SKILL.md) — flujo de push

## Historial de decisiones (jun 2025)

- Primer push a GitHub completado en rama `main`.
- Skill de Git creado para el equipo.
- Análisis de arquitectura documentado para próximas secciones (afiliación, FAQ, servicios en línea).
- Prioridad acordada: completar secciones del navbar antes de refactor grande.
