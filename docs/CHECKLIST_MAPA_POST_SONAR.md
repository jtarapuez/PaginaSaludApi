# Checklist manual — mapa después de cambios Sonar

Validar en navegador que los ajustes de Sonar/accesibilidad **no alteraron** el comportamiento del mapa.

**Requisitos:** API en `http://localhost:8080/api` y front en `http://localhost:4200` (o stack nginx `:8081`).

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 1 | Abrir la página y bajar hasta «Unidades médicas» | El mapa Leaflet carga con tiles y marcadores | ☐ |
| 2 | Esperar carga de datos | Lista de provincias/unidades visible; sin mensaje de error rojo | ☐ |
| 3 | Filtrar por provincia (ej. Pichincha) | Lista y marcadores se actualizan | ☐ |
| 4 | Buscar por nombre (ej. «hospital») | Resultados filtrados en lista y mapa | ☐ |
| 5 | Clic en «Limpiar filtros» | Vuelven todas las unidades; filtros vacíos | ☐ |
| 6 | Expandir/colapsar acordeón de provincia | Se abre y cierra sin errores en consola | ☐ |
| 7 | Clic en un marcador del mapa | Popup con datos de la unidad | ☐ |
| 8 | «Mi ubicación» (permitir GPS si el navegador lo pide) | Marcador de usuario y centrado en mapa | ☐ |
| 9 | «Cómo llegar» / ruta hacia una unidad (móvil o con ubicación activa) | Ruta o instrucciones visibles según dispositivo | ☐ |
| 10 | Abrir modal «Google Maps» y cerrar con **Cancelar** | Modal se cierra; mapa sigue usable | ☐ |
| 11 | Abrir mismo modal y cerrar con clic en el fondo oscuro | Modal se cierra | ☐ |
| 12 | Abrir modal y pulsar **Escape** | Modal se cierra (nuevo binding accesibilidad) | ☐ |
| 13 | Consola del navegador (F12) | Sin errores JavaScript nuevos | ☐ |

## Regresión automática (antes de subir)

```bash
cd PaginaSalud
npm run test:coverage   # 32 tests SUCCESS
export SONAR_TOKEN=...  # token Sonar IESS
npm run sonar           # Quality Gate Passed en dashboard
```

## Cambios Sonar que motivan esta checklist

- Refactor de textos popup/ruta (`obtenerTituloUbicacion`, etc.) — mismo contenido, distinto método.
- `(keydown.escape)` en overlays de modales.
- Sin cambios en lógica Leaflet, filtros API ni geolocalización.
