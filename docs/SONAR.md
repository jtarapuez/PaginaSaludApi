# SonarQube — PaginaSalud

Configuración operativa del análisis Sonar (manual IESS MAN-001 §5.2, adaptado a Angular + Karma).

**Dashboard:** http://192.168.111.89:9000/dashboard?id=pagina-salud  
**Project key:** `pagina-salud`

## Ejecución

```bash
export SONAR_TOKEN=tu_token   # Sonar → My Account → Security
npm run run-sonar             # test:coverage + sonar-scanner
```

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `sonar-project.properties` | Clave proyecto, exclusiones, lcov |
| `karma.conf.js` | Reporte `coverage/pagina-salud/lcov.info` |
| `angular.json` | `karmaConfig` + `codeCoverage` |

## Quality Gate (última validación)

- New Code Coverage ≥ 80% ✓
- New Duplications ≤ 3% ✓
- New Violations = 0 ✓

## Checklist mapa post-cambios

Ver [CHECKLIST_MAPA_POST_SONAR.md](./CHECKLIST_MAPA_POST_SONAR.md).

## Documentación extendida

Copia detallada en el workspace Antigravity: `Documentacion/SONAR_PAGINASALUD.md`.
