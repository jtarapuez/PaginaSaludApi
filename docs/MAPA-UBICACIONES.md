# Mapa de Ubicaciones — Documentación técnica

Documentación del desarrollo del mapa de unidades médicas IESS en Angular + Leaflet.

**Componente:** `MapaUbicacionesComponent`  
**Selector:** `app-mapa-ubicaciones`  
**Ancla de navegación:** `#titulo-mapa`  
**Última actualización:** junio 2025

---

## Índice

1. [Resumen](#1-resumen)
2. [Archivos involucrados](#2-archivos-involucrados)
3. [Dependencias y configuración](#3-dependencias-y-configuración)
4. [Flujo de inicialización](#4-flujo-de-inicialización)
5. [Capa de datos](#5-capa-de-datos)
6. [Estructura de la UI](#6-estructura-de-la-ui)
7. [Leaflet — configuración del mapa](#7-leaflet--configuración-del-mapa)
8. [Marcadores y popups](#8-marcadores-y-popups)
9. [Filtros y búsqueda](#9-filtros-y-búsqueda)
10. [Geolocalización y ubicación del usuario](#10-geolocalización-y-ubicación-del-usuario)
11. [Rutas y acciones externas](#11-rutas-y-acciones-externas)
12. [Estilos (SCSS)](#12-estilos-scss)
13. [Estado del componente](#13-estado-del-componente)
14. [Métodos públicos y privados](#14-métodos-públicos-y-privados)
15. [Testing](#15-testing)
16. [Deuda técnica y mejoras pendientes](#16-deuda-técnica-y-mejoras-pendientes)
17. [Guía para modificar el mapa](#17-guía-para-modificar-el-mapa)

---

## 1. Resumen

El mapa muestra las unidades médicas del IESS en Ecuador usando **Leaflet** y datos de un archivo JSON estático. Incluye:

- Visualización de marcadores por unidad médica
- Filtros por provincia, nivel y búsqueda por texto
- Geolocalización del usuario en móvil ("Mi ubicación")
- Búsqueda de dirección del usuario en PC (Nominatim / OpenStreetMap)
- Marcado manual de ubicación en el mapa
- Cálculo de distancia (fórmula de Haversine)
- Enlaces a Google Maps para rutas
- Panel lateral con resultados filtrados

El componente es **standalone**, autocontenido (sin `@Input`/`@Output`) y concentra ~540 líneas de lógica en un solo archivo TypeScript.

---

## 2. Archivos involucrados

```
src/app/components/mapa-ubicaciones/
├── mapa-ubicaciones.component.ts      # Lógica principal
├── mapa-ubicaciones.component.html    # Template
├── mapa-ubicaciones.component.scss    # Estilos del componente
└── mapa-ubicaciones.component.spec.ts # Tests unitarios

src/app/core/
├── models/unidades-medicas.model.ts
└── services/unidades-medicas.service.ts

src/assets/
├── data/unidades-medicas.json
└── images/leaflet/
    ├── marker-icon.png
    ├── marker-shadow.png
    ├── 64.png
    ├── layers.png
    ├── layers-2x.png
    ├── user-location.png
    └── person-icon.svg

angular.json                           # Leaflet CSS/JS global
src/environments/environment*.ts       # Config mapa (no cableada aún)
```

### Integración en la app

```html
<!-- src/app/app.component.html -->
<app-mapa-ubicaciones></app-mapa-ubicaciones>
```

```typescript
// src/app/app.component.ts
imports: [..., MapaUbicacionesComponent]
```

---

## 3. Dependencias y configuración

### Paquetes npm

| Paquete | Versión | Uso |
|---------|---------|-----|
| `leaflet` | ^1.9.4 | Motor del mapa |
| `@types/leaflet` | ^1.9.18 | Tipos TypeScript |
| `@fortawesome/fontawesome-free` | ^6.7.2 | Iconos UI y marcador usuario |
| `@angular/forms` | ^19.2 | `FormsModule` / `ngModel` |

### Carga de Leaflet (doble vía)

**1. Global** — `angular.json`:

```json
"styles": ["node_modules/leaflet/dist/leaflet.css", ...],
"scripts": ["node_modules/leaflet/dist/leaflet.js"]
```

**2. ES Module** — en el componente:

```typescript
import * as L from 'leaflet';
```

El componente usa siempre el `L` del import. Evitar mezclar con `window.L` del script global.

### HttpClient

Requerido por `UnidadesMedicasService`. Configurado en `app.config.ts`:

```typescript
provideHttpClient(withInterceptorsFromDi())
```

---

## 4. Flujo de inicialización

```
ngOnInit()
  │
  ├─ configurarIconosLeaflet()
  │    ├─ Fix iconos default Leaflet (rutas assets/)
  │    ├─ userLocationIcon (divIcon azul + fa-user)
  │    └─ hospitalIcon (marker-icon.png)
  │
  └─ unidadesMedicasService.getUnidadesMedicas()
       │
       ├─ on success:
       │    ├─ provinciasUnidades = data
       │    ├─ provincias[] para filtro
       │    ├─ provinciasExpandidas{} = true
       │    └─ setTimeout(500ms) → inicializarMapa()
       │
       └─ on error: console.error

inicializarMapa()
  │
  ├─ Si map existe → map.remove()
  ├─ L.map('mapa-ubicaciones', { center, zoom: 7 })
  ├─ L.tileLayer(OpenStreetMap)
  ├─ setTimeout(100ms) → map.invalidateSize()
  └─ cargarMarcadores()
```

### Parámetros iniciales del mapa

| Parámetro | Valor | Notas |
|-----------|-------|-------|
| Centro | `[-1.831239, -78.183406]` | Ecuador |
| Zoom inicial | `7` | Vista país |
| Zoom usuario | `12` | Tras geolocalización |
| Zoom unidad | `15` | Al centrar en hospital |
| Tiles | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | OSM |
| maxZoom | `19` | En tileLayer |

> `environment.mapConfig` define los mismos valores pero **no se usa** en el componente todavía.

### Contenedor DOM

El mapa se monta en:

```html
<div id="mapa-ubicaciones"></div>
```

Debe existir en el DOM antes de `L.map()`. Por eso hay un `setTimeout(500)` tras cargar datos.

---

## 5. Capa de datos

### Modelo — `unidades-medicas.model.ts`

```typescript
interface UnidadMedica {
  nombre: string;
  nivel: number;           // 1, 2 o 3
  latitud: number;
  longitud: number;
  descripcion: string;
  telefono: string;
  sitio_web: string;
  siglas: string;
  direccion: string;
}

interface ProvinciaUnidades {
  provincia: string;
  unidades: UnidadMedica[];
}
```

### Servicio — `UnidadesMedicasService`

```typescript
getUnidadesMedicas(): Observable<ProvinciaUnidades[]>
```

- URL: `assets/data/unidades-medicas.json` (hardcodeada)
- Caché: `shareReplay(1)`
- `clearCache()` para invalidar

### Estructura del JSON

```json
[
  {
    "provincia": "PICHINCHA",
    "unidades": [
      {
        "nombre": "HOSPITAL DE ESPECIALIDADES - CARLOS ANDRADE MARÍN",
        "nivel": 2,
        "latitud": -0.2051303,
        "longitud": -78.5048297,
        "descripcion": "III NIVEL",
        "telefono": "02-2564939",
        "siglas": "HCAM",
        "sitio_web": "https://hcam.iess.gob.ec/",
        "direccion": "18 de Septiembre N19-63..."
      }
    ]
  }
]
```

~1258 líneas, todas las provincias del Ecuador con unidades IESS.

---

## 6. Estructura de la UI

```
.mapa-container
│
├── #titulo-mapa                    Título sección (estilo tituloPF)
│
├── .search-bar
│   ├── .search-input               Input búsqueda + icono
│   └── .location-btn               Botón "Mi ubicación"
│
└── .content-container              Flex: panel + mapa
    │
    ├── .left-panel (320px)
    │   ├── .filters-section
    │   │   ├── select provincia
    │   │   ├── select nivel (1, 2, 3)
    │   │   └── .btn-limpiar (si hay filtro)
    │   │
    │   └── .results-section        Solo si filtroAplicado
    │       └── .hospital-info      Tarjetas con acciones
    │
    └── .map-container
        └── #mapa-ubicaciones       Contenedor Leaflet (absolute 100%)
```

### Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| Desktop | Panel izquierdo 320px + mapa flexible |
| ≤768px | Mapa arriba (400px), panel abajo, búsqueda en columna |

---

## 7. Leaflet — configuración del mapa

### Creación

```typescript
this.map = L.map('mapa-ubicaciones', {
  center: [-1.831239, -78.183406],
  zoom: 7,
  zoomControl: true,
  attributionControl: true
});
```

### Capa de tiles

```typescript
this.tileLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '...', maxZoom: 19 }
);
this.tileLayer.addTo(this.map);
```

### invalidateSize()

Se llama 100 ms después de crear el mapa para corregir dimensiones cuando el contenedor aún se está renderizando.

### Reinicio del mapa

Si `inicializarMapa()` se llama de nuevo, elimina la instancia anterior con `map.remove()` antes de crear una nueva.

---

## 8. Marcadores y popups

### Marcadores de hospitales

```typescript
L.marker([unidad.latitud, unidad.longitud], {
  icon: this.hospitalIcon
}).bindPopup(this.crearContenidoPopup(unidad));
```

- Icono: `assets/images/leaflet/marker-icon.png`
- Se almacenan en `this.markers: L.Marker[]`

### Popup de hospital (`crearContenidoPopup`)

Contenido HTML string con:

- Siglas, nombre, dirección, nivel, teléfono
- Distancia en km (si `userLocation` existe)
- Botón "Ver ruta en Google Maps" (si hay ubicación usuario)

### Marcador de usuario

```typescript
L.marker([lat, lng], { icon: this.userLocationIcon })
```

- `userLocationIcon`: `L.divIcon` circular azul (#4285f4) con `fa-user`
- Animación `pulse` vía CSS en `.user-location-marker`
- Popup con coordenadas
- Centra mapa en zoom 12

### Actualización de marcadores al filtrar

`mostrarMarcadoresEnMapa()`:

1. Elimina todos los marcadores (`marker.remove()`)
2. Limpia array `markers`
3. Recrea solo los de `provinciasFiltradas` o `provinciasUnidades` según `filtroAplicado`

> El marcador de usuario (`userLocationMarker`) **no se elimina** al filtrar.

---

## 9. Filtros y búsqueda

### Búsqueda por texto

- Binding: `[(ngModel)]="terminoBusqueda"`
- Evento: `(input)="buscarPorNombre()"`
- Normaliza texto (minúsculas, sin acentos) con `normalizarTexto()`
- Busca en: `nombre`, `siglas`, `direccion`
- Si el término está vacío → limpia filtros y muestra todos los marcadores

### Filtro por provincia

- `[(ngModel)]="provinciaSeleccionada"`
- `(change)="filtrarPorProvincia()"`

### Filtro por nivel

- `[(ngModel)]="nivelSeleccionado"` — valores `1`, `2`, `3` o `null`
- `(change)="filtrarPorNivel()"`

### Aplicación de filtros (`aplicarFiltros`)

Los filtros son **combinables** (AND):

1. Filtra por provincia (si seleccionada)
2. Filtra unidades por nivel (si seleccionado)
3. Filtra por término de búsqueda (si no vacío)
4. Actualiza `provinciasFiltradas`
5. Llama `mostrarMarcadoresEnMapa()`

### Limpiar filtros

`limpiarFiltros()` resetea todos los campos, `filtroAplicado = false` y restaura todos los marcadores.

### Panel de resultados

Solo visible cuando `filtroAplicado === true`. Muestra tarjetas con acciones:

| Botón | Método | Condición |
|-------|--------|-----------|
| Teléfono | `llamarUnidad(telefono)` | Siempre |
| Web | enlace `[href]` | Si `sitio_web` no vacío |
| Mapa | `centrarEnUnidad(lat, lng, nombre)` | Siempre |
| Ruta | `mostrarRuta(lat, lng)` | Solo si `userLocation` existe |

---

## 10. Geolocalización y ubicación del usuario

### Comportamiento por dispositivo

| Dispositivo | Mi ubicación (GPS) | Buscar mi dirección | Marcar en mapa |
|-------------|-------------------|---------------------|----------------|
| Móvil (≤768px) | Sí | No | Sí |
| PC (>768px) | No (oculto) | Sí (Nominatim) | Sí |

Detección: `window.matchMedia('(max-width: 768px)')` con listener `change` en `configurarDeteccionDispositivo()`.

Origen de la ubicación (`origenUbicacion`): `'gps' | 'manual' | 'geocoded'`.

### Template — Mi ubicación (solo móvil)

```html
<button *ngIf="esDispositivoMovil" (click)="solicitarUbicacionUsuario()" class="location-btn">
  <i class="fas fa-map-marker-alt"></i> Mi ubicación
</button>
```

### Flujo GPS (móvil)

```
Click "Mi ubicación"
  │
  └─ solicitarUbicacionUsuario()
       │
       ├─ navigator.geolocation.getCurrentPosition()
       │    │
       │    ├─ ÉXITO:
       │    │    ├─ origenUbicacion = 'gps'
       │    │    ├─ aplicarUbicacionUsuario(lat, lng)
       │    │    └─ actualizarMarcadoresConDistancia()
       │    │
       │    └─ ERROR:
       │         ├─ PERMISSION_DENIED → modal con instrucciones
       │         └─ POSITION_UNAVAILABLE → mensaje inline + activar "Marcar en mapa"
       │
       └─ Si no soportado: mensaje inline
```

### Opciones de geolocalización

```typescript
{
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 0
}
```

### Geocodificación de dirección (PC)

En PC el GPS del navegador suele fallar (`POSITION_UNAVAILABLE`). El usuario indica su ubicación con:

1. **Buscar mi dirección** — campo + botón que llama `buscarDireccionUsuario()`
2. **Marcar en mapa** — clic en el mapa (`origenUbicacion = 'manual'`)

#### API Nominatim (OpenStreetMap)

Configuración en `environment.geocoding`:

```typescript
geocoding: {
  nominatimUrl: 'https://nominatim.openstreetmap.org/search',
  userAgent: 'PaginaSalud-IESS/1.0',
  countryCode: 'ec'
}
```

Parámetros de búsqueda: `q`, `format=json`, `countrycodes=ec`, `limit=5`, `addressdetails=1`.

Headers: `Accept-Language: es`.

Flujo:

```
buscarDireccionUsuario()
  ├─ Validar mínimo 4 caracteres
  ├─ GET Nominatim vía HttpClient
  ├─ 0 resultados → mensaje inline
  ├─ 1 resultado → origenUbicacion = 'geocoded' → aplicarUbicacionUsuario()
  └─ Varios → lista desplegable → seleccionarResultadoGeocodificacion()
```

**Límites de uso:** Nominatim exige máximo ~1 petición/segundo; no autocompletar en cada tecla (solo Enter o botón Buscar).

**Atribución:** Los datos provienen de OpenStreetMap contributors (tiles y geocodificación).

### Requisitos del navegador (GPS)

- **Contexto seguro:** HTTPS o `localhost`
- **Permiso del usuario:** el navegador debe permitir ubicación
- En HTTP remoto (no localhost) la API falla

### Actualización de distancias

`actualizarMarcadoresConDistancia()` recorre cada marcador, busca la unidad por coordenadas (tolerancia 0.0001°) y actualiza el popup con `crearContenidoPopup()` incluyendo distancia.

### Cálculo de distancia

Fórmula de **Haversine** en `calcularDistancia()` — resultado en kilómetros.

---

## 11. Rutas y acciones externas

### Google Maps — ruta

```typescript
mostrarRuta(latDestino, lngDestino)
```

URL generada:

```
https://www.google.com/maps/dir/{userLat},{userLng}/{destLat},{destLng}/@{destLat},{destLng},15z
```

Requiere `userLocation` previo. En PC, si no hay ubicación, muestra mensaje para usar "Buscar mi dirección" o "Marcar en mapa". En móvil, intenta GPS automáticamente.

También disponible en popups de marcadores vía `window.open()` en HTML inline.

### Llamar unidad

```typescript
llamarUnidad(telefono) → window.location.href = `tel:${telefono}`
```

### Centrar en unidad

```typescript
centrarEnUnidad(lat, lng, nombre)
```

- `map.setView([lat, lng], 15)`
- Busca marcador por coordenadas y abre su popup

---

## 12. Estilos (SCSS)

Archivo: `mapa-ubicaciones.component.scss` (~548 líneas)

### Secciones principales

| Clase | Propósito |
|-------|-----------|
| `.mapa-container` | Contenedor general, min-height 80vh |
| `#titulo-mapa` | Barra título azul #204f79 |
| `.search-bar` | Barra búsqueda + botón ubicación |
| `.location-btn` | Botón azul gradiente "Mi ubicación" |
| `.content-container` | Flex panel + mapa, max 650px alto |
| `.left-panel` | Panel filtros 320px |
| `.map-container` | Contenedor relativo del mapa |
| `#mapa-ubicaciones` | Absolute 100%, z-index 1 |

### Leaflet deep styles

```scss
:host ::ng-deep {
  .leaflet-popup-content-wrapper { ... }
  .leaflet-popup-content { ... }
  .user-location-marker { animation pulse }
  .hospital-icon { drop-shadow }
}
```

### Colores principales

| Uso | Color |
|-----|-------|
| Primario | `#01579b` |
| Título sección | `#204f79` |
| Ubicación usuario | `#4285f4` |
| Botón limpiar | `#d32f2f` |
| Acción teléfono | `#2e7d32` |
| Acción mapa | `#f57c00` |
| Acción ruta | `#7b1fa2` |

---

## 13. Estado del componente

### Datos

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `provinciasUnidades` | `ProvinciaUnidades[]` | Datos completos del JSON |
| `provinciasFiltradas` | `ProvinciaUnidades[]` | Resultado tras filtros |
| `provincias` | `string[]` | Lista para select |
| `niveles` | `number[]` | `[1, 2, 3]` |

### Filtros UI

| Propiedad | Tipo | Default |
|-----------|------|---------|
| `provinciaSeleccionada` | `string` | `''` |
| `nivelSeleccionado` | `number \| null` | `null` |
| `terminoBusqueda` | `string` | `''` |
| `filtroAplicado` | `boolean` | `false` |

### Leaflet

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `map` | `L.Map?` | Instancia del mapa |
| `markers` | `L.Marker[]` | Marcadores hospitales |
| `userLocationMarker` | `L.Marker \| null` | Marcador usuario |
| `tileLayer` | `L.TileLayer \| null` | Capa OSM |
| `userLocationIcon` | `L.Icon \| L.DivIcon` | Icono usuario |
| `hospitalIcon` | `L.Icon` | Icono hospital |

### Geolocalización

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `userLocation` | `{lat, lng} \| null` | Coordenadas GPS usuario |

### Código no utilizado

| Propiedad / Método | Estado |
|--------------------|--------|
| `rutaLayer` | Declarado, nunca usado |
| `mostrarMapa` | Declarado, no en template |
| `toggleMapa()` | No referenciado en HTML |
| `toggleProvincia()` | No referenciado en HTML |
| `actualizarDistanciasEnMarcadores()` | Alias sin uso externo |

---

## 14. Métodos públicos y privados

### Lifecycle

| Método | Cuándo |
|--------|--------|
| `ngOnInit()` | Carga iconos + datos + mapa |
| `ngAfterViewInit()` | Solo log (no usado para mapa) |

### Mapa

| Método | Visibilidad | Descripción |
|--------|-------------|-------------|
| `configurarIconosLeaflet()` | private | Iconos Leaflet |
| `inicializarMapa()` | public | Crea instancia L.Map |
| `cargarMarcadores()` | private | Marcadores iniciales |
| `mostrarMarcadoresEnMapa()` | public | Recrea marcadores según filtro |
| `crearContenidoPopup(unidad)` | private | HTML del popup |

### Geolocalización

| Método | Descripción |
|--------|-------------|
| `solicitarUbicacionUsuario()` | Pide GPS al navegador |
| `mostrarUbicacionUsuarioEnMapa()` | Dibuja marcador usuario |
| `actualizarMarcadoresConDistancia()` | Actualiza popups con km |
| `calcularDistancia()` | Haversine en km |
| `deg2rad()` | Helper trigonométrico |

### Filtros

| Método | Descripción |
|--------|-------------|
| `buscarPorNombre()` | Filtro texto |
| `filtrarPorProvincia()` | Filtro provincia |
| `filtrarPorNivel()` | Filtro nivel |
| `limpiarFiltros()` | Reset completo |
| `aplicarFiltros()` | Lógica combinada |
| `normalizarTexto()` | Quita acentos |
| `getTotalUnidades()` | Contador resultados |

### Acciones

| Método | Descripción |
|--------|-------------|
| `centrarEnUnidad()` | Zoom + popup en hospital |
| `mostrarRuta()` | Abre Google Maps |
| `llamarUnidad()` | Protocolo `tel:` |

---

## 15. Testing

Archivo: `mapa-ubicaciones.component.spec.ts`

### Tests existentes

1. `should create` — creación del componente
2. `should load medical units on init` — carga datos del servicio mock
3. `should extract provinces from data` — extrae provincias

### Sin cobertura

- Inicialización Leaflet
- Geolocalización / botón ubicación
- Filtros y búsqueda
- `calcularDistancia()`
- `mostrarMarcadoresEnMapa()`
- Popups y rutas

### Mock del servicio

```typescript
const mockUnidadesMedicas = [{
  provincia: 'Pichincha',
  unidades: [{ nombre: '...', latitud: -0.1807, longitud: -78.4678, ... }]
}];
```

---

## 16. Deuda técnica y mejoras pendientes

| Prioridad | Item | Detalle |
|-----------|------|---------|
| Alta | Fallo silencioso botón ubicación | Si mapa no listo, no hay feedback |
| Alta | Cablear `environment` | URLs, zoom, centro, logging (geocoding ya cableado) |
| Media | Unificar carga Leaflet | Quitar script global o import, no ambos |
| Media | `OnDestroy` | Limpiar mapa, marcadores, geolocation |
| Media | NgZone en callback GPS | Implementado |
| Media | Estado loading en botón | Implementado (GPS y geocodificación) |
| Baja | Extraer `MapService` | Separar lógica Leaflet del componente |
| Baja | Eliminar código muerto | `toggleMapa`, etc. |
| Baja | Tests geolocalización y filtros | Cobertura real |
| Baja | Popups con DomSanitizer o componentes Angular | En lugar de HTML string |
| Resuelto | Logs de debug GPS | Eliminados (fetch a endpoint local) |

---

## 17. Guía para modificar el mapa

### Agregar un campo al popup

1. Asegurar que el campo existe en `UnidadMedica` y en el JSON
2. Editar `crearContenidoPopup()` en el `.ts`

### Cambiar iconos

1. Reemplazar archivos en `src/assets/images/leaflet/`
2. Ajustar `configurarIconosLeaflet()` si cambian tamaños

### Cambiar fuente de datos a API

1. Modificar `UnidadesMedicasService` para usar `environment.unidadesMedicasDataUrl`
2. Mantener la misma interfaz `ProvinciaUnidades[]`
3. El componente no debería cambiar si la respuesta tiene la misma forma

### Cambiar tiles del mapa

1. Idealmente usar `environment.mapTilesUrl`
2. Editar URL en `inicializarMapa()` → `L.tileLayer(...)`

### Agregar un nuevo filtro

1. Nueva propiedad en el componente
2. Control en el HTML (`.filters-section`)
3. Lógica en `aplicarFiltros()`
4. `mostrarMarcadoresEnMapa()` se actualiza automáticamente

### Arreglar botón "Mi ubicación"

Causas probables a investigar:

1. Mapa no inicializado al hacer click (race condition 500ms)
2. Permiso de ubicación denegado
3. No está en HTTPS/localhost
4. Timeout por `enableHighAccuracy` en desktop

---

## Referencias cruzadas

- [ARQUITECTURA.md](ARQUITECTURA.md) — Arquitectura general del proyecto
- [AGENTS.md](../AGENTS.md) — Guía para agentes Cursor
- [GUIA-AMBIENTES.md](../GUIA-AMBIENTES.md) — Ambientes de build
