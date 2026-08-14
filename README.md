# salud-geolocalizacion-uiApi (salud-geolocalizacion-ui IESS)

Aplicación Angular para la página de salud del IESS, con mapa de unidades médicas y geolocalización (Leaflet).

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.12.

## Development server

To start a local development server, run:

```bash
npm start
# o: ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Documentación

| Documento | Audiencia |
|-----------|-----------|
| [AGENTS.md](AGENTS.md) | Agentes de Cursor / onboarding técnico |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Arquitectura detallada del proyecto |
| [docs/MAPA-UBICACIONES.md](docs/MAPA-UBICACIONES.md) | Mapa Leaflet, geolocalización y filtros |
| [docs/DOCKER.md](docs/DOCKER.md) | Front en Docker (nginx + proxy API) |
| [docs/SONAR.md](docs/SONAR.md) | Análisis SonarQube (Karma + lcov) |
| [docs/CHECKLIST_MAPA_POST_SONAR.md](docs/CHECKLIST_MAPA_POST_SONAR.md) | Validación manual del mapa tras cambios Sonar |
| [GUIA-AMBIENTES.md](GUIA-AMBIENTES.md) | Ambientes dev / staging / producción |

## Ambientes

Ver [GUIA-AMBIENTES.md](GUIA-AMBIENTES.md) para desarrollo, staging y producción.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Docker (nginx)

Front en contenedor; la API sigue en **salud-geolocalizacion-api** (`:8080` en el host). Nginx sirve el build y hace proxy de `/api` al backend.

```bash
# Requiere API en http://localhost:8080/api (Maven o docker-compose en salud-geolocalizacion-api)
cd salud-geolocalizacion-ui
docker-compose up -d --build
```

- **URL:** http://localhost:4200/
- **Contenedor:** `salud_geolocalizacion_ui`
- **Imagen:** `salud-geolocalizacion-ui:1.0.0`

> No usar `npm start` y Docker a la vez en el puerto **4200**.

Documentación detallada: [docs/DOCKER.md](docs/DOCKER.md).

## Running unit tests

```bash
ng test
```

Con cobertura (requerido antes de Sonar):

```bash
npm run test:coverage
```

## SonarQube

Análisis de calidad según manual IESS MAN-001 §5.2. Documentación completa: [Documentacion/SONAR_PAGINASALUD.md](../Documentacion/SONAR_PAGINASALUD.md).

```bash
export SONAR_TOKEN=tu_token   # obtener en http://192.168.111.89:9000 → My Account → Security
npm run run-sonar             # tests + cobertura + análisis
```

Dashboard: http://192.168.111.89:9000/dashboard?id=salud-geolocalizacion-ui

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
