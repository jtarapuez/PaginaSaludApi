# Docker — PaginaSalud (frontend)

**Fecha:** 2026-08-04  
**Estado:** Implementado — modo liviano (solo front en Docker)

---

## 1. Arquitectura

```
┌─────────────────────────┐     proxy /api      ┌──────────────────────────┐
│  Docker                 │  ───────────────►  │  BaseSpringApi :8080      │
│  pagina_salud_app       │  host.docker.      │  (Maven o base_spring_app)│
│  nginx :4200 → :80      │  internal          │  Oracle DBDVP externo     │
└─────────────────────────┘                     └──────────────────────────┘
         ▲
         │ navegador
    http://localhost:4200
```

- **Docker empaqueta el front** (build Angular + nginx).
- **La API no va en este compose** — se consume desde el host (`:8080`).
- El navegador llama a `/api/...` (mismo origen); nginx reenvía al backend.

---

## 2. Archivos

| Archivo | Uso |
|---------|-----|
| `Dockerfile` | Build multi-stage (Node 20 + nginx alpine) |
| `docker-compose.yml` | Servicio `pagina_salud_app` |
| `nginx.conf` | SPA + proxy `/api/` → `host.docker.internal:8080` |
| `.dockerignore` | Excluye `node_modules`, `dist`, etc. |
| `src/environments/environment.docker.ts` | `apiUrl: '/api'` para el proxy |

Configuración Angular: `ng build --configuration=docker` (ver `angular.json`).  
Script npm: `npm run build:docker`.

---

## 3. Arranque (modo liviano)

### Prerrequisitos

1. Docker Desktop en ejecución.
2. **API disponible** en `http://localhost:8080/api/health` (una de):
   - `cd BaseSpringApi && mvn spring-boot:run -Dspring-boot.run.profiles=oracle`
   - `cd BaseSpringApi && docker-compose up -d` → `base_spring_app`
3. Puerto **4200 libre** (no `ng serve` a la vez).

### Comandos

```bash
cd PaginaSalud
docker-compose up -d --build
docker-compose logs -f front
```

Arranque con validación de puertos (skill del workspace):

```bash
.cursor/skills/lev-paginasalud-docker/scripts/start-docker.sh
```

Skill Cursor: **`lev-paginasalud-docker`** (pedir: “levanta el front en Docker”).

### Verificación

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4200/
curl -s http://localhost:4200/api/health
```

Abrir http://localhost:4200/ → mapa con unidades médicas.

### Detener

```bash
cd PaginaSalud
docker-compose down
```

---

## 4. Puertos

| Puerto | Servicio | Obligatorio |
|--------|----------|-------------|
| **4200** | Front nginx (mapeo host) | Sí |
| **8080** | API en host (externo al compose del front) | Sí para datos del mapa |

---

## 5. Comparación: `npm start` vs Docker

| | `npm start` | `docker-compose up` |
|--|-------------|---------------------|
| Puerto | 4200 | 4200 |
| API | `environment.ts` → `localhost:8080` | `environment.docker.ts` → `/api` (proxy nginx) |
| Hot reload | Sí | No (rebuild imagen) |
| Uso | Desarrollo diario | Demo / QA / despliegue estático |

---

## 6. Producción / staging

Para despliegue institucional usar los environments existentes:

| Config | Archivo | API |
|--------|---------|-----|
| `production` | `environment.production.ts` | URL institucional |
| `staging` | `environment.staging.ts` | URL staging |
| `docker` | `environment.docker.ts` | `/api` (proxy local) |

En servidor QA/PROD ajustar `nginx.conf` (o ingress) con la URL real del API gateway.

---

## 7. Troubleshooting

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| Mapa vacío / error de carga | API caída en :8080 | Levantar BaseSpringApi |
| `bind: address already in use` (4200) | `ng serve` activo | Detener `npm start` |
| 502 en `/api/*` | Backend no alcanzable desde contenedor | Verificar `host.docker.internal` (Mac/Win); en Linux el compose ya incluye `extra_hosts` |
| Cambios no visibles | Imagen cacheada | `docker-compose up -d --build` |
| Fallo `npm ci` en build | Certificados / red corporativa | El Dockerfile usa `NPM_CONFIG_STRICT_SSL=false` en el stage builder |

---

## 8. Referencias

| Documento | Contenido |
|-----------|-----------|
| [README.md](../README.md) | Arranque rápido |
| [GUIA-AMBIENTES.md](../GUIA-AMBIENTES.md) | Ambientes Angular |
| [MAPA-UBICACIONES.md](./MAPA-UBICACIONES.md) | Mapa Leaflet y filtros |
| Stack API+front+gateway (:8081) | `Documentacion/DOCKER_SALUD_STACK.md` (workspace Antigravity) |
