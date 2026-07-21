

# Plan Ejecutivo — PaginaSalud (IESS Salud)

**Proyecto:** Landing page institucional + Mapa de unidades médicas  
**Referencia de diseño:** `docs/Landing_page_salud.pdf`  
**Stack:** Angular 19 · Leaflet · Spring Boot (API) · Bootstrap 5  
**Repositorio:** GeolocalizacionSalud / PaginaSalud  

---

## 1. Resumen ejecutivo

Este documento consolida el estado actual del proyecto, el avance reportado por frente de trabajo y el cronograma acordado hasta el despliegue en producción.

| Frente | Avance actual | Plazo acordado | Avance pendiente |
|--------|:-------------:|:--------------:|:----------------:|
| Landing page | **10%** | **1 semana** | ~90% |
| Mapa de unidades médicas + API | **20%** | **4 semanas** | ~80% |
| Despliegue (dev / staging / prod) | **~0%** | **2 semanas** | ~95% |

**Tiempo total estimado hasta producción (ejecución en paralelo):** aproximadamente **6 semanas calendario**.

**Tiempo total en secuencia estricta:** 1 + 4 + 2 = **7 semanas**.

---

## 2. Alcance del proyecto

### 2.1 Landing page (referencia PDF)

Secciones previstas según el diseño de referencia y el menú de navegación:

| Sección | Ancla | Estado actual |
|---------|-------|:-------------:|
| Inicio / Banner | `#inicioPagina` | Parcial |
| ¿Quiénes están protegidos? | `#montos` | Parcial |
| Video tutoriales | `#video` | Parcial |
| Agendamiento de citas | — | Parcial |
| Servicios en línea | `#servicios` | Pendiente |
| Afiliado joven | `#jovenVoluntario` | Pendiente |
| Afiliado voluntario | `#voluntarioIndependiente` | Pendiente |
| Gestores culturales | `#gestoresCulturales` | Pendiente |
| Trabajo no remunerado hogar | `#trabajoNoRemuneradoHogar` | Pendiente |
| Afiliado exterior | `#voluntarioExterior` | Pendiente |
| Preguntas frecuentes | `#preguntasFrecuentes` | Pendiente |
| Mapa unidades médicas | `#titulo-mapa` | En desarrollo |

### 2.2 Mapa de unidades médicas

- Visualización de unidades médicas IESS en mapa interactivo (Leaflet).
- Filtros por provincia, nivel y búsqueda por texto.
- En **PC:** ruta hacia unidad vía Google Maps (modal instructivo, sin ruta automática).
- En **móvil:** geolocalización GPS nativa + enlace a Google Maps.
- Integración futura con **API REST Spring Boot** (reemplazo de JSON estático).

### 2.3 Despliegue

- Ambientes: desarrollo, staging y producción.
- Build Angular (`ng build`) y backend Spring Boot.
- Configuración HTTPS, CORS y variables de entorno.
- Pruebas en staging y puesta en producción IESS.

---

## 3. Estado actual del avance (10% / 20%)

### 3.1 Landing page — 10%

**Implementado (base estructural):**

- Shell de aplicación Angular standalone.
- Navbar con menú y anclas.
- Componentes: banner
- Estilos globales SCSS y animaciones scroll.
- Imágenes de apoyo (`bot_*.png`, logos, iconografía).

**Pendiente (~90%):**

- Secciones de contenido institucional faltantes (servicios, afiliación, FAQ).
- Ajuste fino de textos vs. PDF de referencia.
- QA responsive y validación visual completa.

### 3.2 Mapa — 20%

**Implementado (prototipo funcional):**

- Componente `MapaUbicacionesComponent` con Leaflet.
- Datos desde JSON estático (`unidades-medicas.json`).


**Pendiente (~80%):**

- API Spring Boot y endpoints de unidades médicas.
- Integración Angular ↔ API (`environment`, servicio, CORS).
- Pruebas en dispositivos reales (Android / iPhone).
- Limpieza técnica, documentación y UAT con negocio.
- Validación para producción.

### 3.3 Despliegue — ~5%

**Implementado:**

- Configuraciones `environment` (dev, staging, production).
- Scripts de ambiente (`scripts/ambiente.sh`).
- Build Angular operativo.

**Pendiente (~95%):**

- Infraestructura de servidores IESS.
- Pipeline CI/CD formal.
- Despliegue backend y frontend en staging/prod.
- Monitoreo y plan de rollback.

---

## 4. Cronograma acordado

### 4.1 Landing page — 1 semana (10% → 100%)

| Día | Actividad | Entregable |
|:---:|-----------|------------|
| 1 | Servicios en línea + estructura FAQ | Sección `#servicios` y base `#preguntasFrecuentes` |
| 2 | Modalidades de afiliación (1–2) | Componentes con anclas de menú |
| 3 | Modalidades de afiliación (3–5) | Resto de modalidades del dropdown |
| 4 | Contenidos, anclas navbar, responsive | Textos alineados al PDF |
| 5 | QA visual y cierre | Landing lista para integración final |

**Condición crítica:** contenidos institucionales aprobados y uso de plantillas reutilizables.

---

### 4.2 Mapa + API — 4 semanas (20% → 100%)

| Semana | Actividad | Entregable |
|:------:|-----------|------------|
| **S1** | UX PC/móvil, pruebas GPS/Google Maps, limpieza código | Mapa estable en dev |
| **S2** | Spring Boot MVP — endpoints lectura unidades médicas | API REST documentada |
| **S3** | Integración Angular, CORS, manejo de errores, `environment` | Front consumiendo API |
| **S4** | QA, UAT negocio, documentación, preparación staging | Mapa listo para despliegue |

**Endpoints API previstos (MVP):**

```
GET /api/unidades-medicas
GET /api/unidades-medicas/buscar?q={termino}   (opcional)
GET /api/unidades-medicas/{siglas}             (opcional)
```

---

### 4.3 Despliegue — 2 semanas (~5% → 100%)

| Semana | Actividad | Entregable |
|:------:|-----------|------------|
| **S1** | Ambientes, builds, backend en servidor, CI/CD inicial | Staging operativo |
| **S2** | Pruebas staging, seguridad (HTTPS/CORS), go-live, monitoreo | Producción estable |

**Dependencias externas:**

- Acceso a servidores y red IESS.
- Certificados SSL.
- Base de datos Oracle (si aplica al backend).
- Aprobación de seguridad institucional.

---

## 5. Cronograma integrado (paralelo recomendado)

```
Semana 1     │ Landing 10% → 100%     │ Mapa 20% → ~35%  (S1)
Semanas 2–4  │ Landing 100%           │ Mapa ~35% → 100% (S2–S4)
Semanas 5–6  │ Despliegue 2 semanas   │ Go-live
─────────────────────────────────────────────────────────────
Total: ~6 semanas calendario hasta producción
```

### Hitos de control

| Hito | Semana | Landing | Mapa | Criterio de aceptación |
|------|:------:|:-------:|:----:|------------------------|
| **H1** | 1 | 100% | ~35% | Todas las secciones landing visibles y navegables |
| **H2** | 3 | 100% | ~65% | API integrada; mapa carga desde backend |
| **H3** | 4 | 100% | 100% | UAT mapa aprobado |
| **H4** | 6 | 100% | 100% | Producción en línea y monitoreada |

---

## 6. Equipo y responsabilidades sugeridas

| Rol | Responsabilidad principal |
|-----|---------------------------|
| Frontend Angular | Landing (1 sem) + integración mapa/API |
| Backend Spring Boot | API unidades médicas (semanas 2–3) |
| QA / UAT | Pruebas móvil, cross-browser, staging |
| Infra / DevOps | Despliegue 2 semanas, CI/CD, prod |
| Negocio / contenido | Aprobación textos PDF, validación FAQ y afiliación |

---

## 7. Riesgos y mitigación

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|:------------:|------------|
| Contenidos sin aprobar | Retraso landing | Alta | Entregar borrador día 1; plantillas genéricas |
| Sin acceso infra IESS | Retraso despliegue +2 sem | Media | Solicitar accesos en semana 1 |
| API / BD no definida | Retraso mapa S2 | Media | MVP con JSON en backend; migrar a Oracle después |
| GPS distinto por dispositivo | Retraso mapa S1 | Media | Matriz de pruebas Android/iPhone |
| Menú PDF ≠ menú actual | Alcance extra | Baja | Acordar alcance cerrado antes de semana 1 |

---

## 8. Entregables finales

Al cierre del plan (semana 6):

1. Landing page completa según alcance acordado y PDF de referencia.
2. Mapa de unidades médicas consumiendo API Spring Boot.
3. Documentación técnica actualizada (`ARQUITECTURA.md`, `MAPA-UBICACIONES.md`).
4. Ambientes dev, staging y producción desplegados.
5. Evidencia de pruebas (QA móvil, staging, smoke prod).

---

## 9. Referencias

| Documento | Ubicación |
|-----------|-----------|
| Diseño landing | `docs/Landing_page_salud.pdf` |
| Arquitectura técnica | `docs/ARQUITECTURA.md` |
| Mapa — documentación | `docs/MAPA-UBICACIONES.md` |
| Guía ambientes | `GUIA-AMBIENTES.md` |
| Guía agentes / convenciones | `AGENTS.md` |

---

## 10. Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Líder técnico | | | |
| Product owner / negocio | | | |
| Patrocinador proyecto | | | |

---

*Documento generado para exportación a PDF. Compatible con Pandoc, VS Code (Markdown PDF), Typora y GitHub print-to-PDF.*

**Comando sugerido (Pandoc):**

```bash
pandoc docs/PLAN-EJECUTIVO.md -o docs/PLAN-EJECUTIVO.pdf \
  --pdf-engine=xelatex \
  -V lang=es \
  -V geometry:margin=2.5cm
```
