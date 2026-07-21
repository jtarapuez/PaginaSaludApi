---
name: git-geolocalizacion-salud
description: >-
  Sube cambios del proyecto PaginaSalud/GeolocalizacionSalud al repositorio
  GitHub de jtarapuez. Usar cuando el usuario pida subir a git, hacer push,
  sincronizar con GitHub, publicar cambios o conectar el repo remoto.
---

# Git — GeolocalizacionSalud (jtarapuez)

## Repositorio

| Campo | Valor |
|-------|-------|
| URL remota | `https://github.com/jtarapuez/GeolocalizacionSalud.git` |
| Usuario GitHub | `jtarapuez` |
| Correo Git | `tarapuez9@gmail.com` |
| Rama principal | `main` |
| Proyecto local | `PaginaSalud` (Angular) |

## Reglas obligatorias

1. **Solo commitear** cuando el usuario lo pida explícitamente.
2. **Solo hacer push** cuando el usuario lo pida explícitamente.
3. **No modificar** `git config` global ni local (usuario/correo ya configurados).
4. **No usar** comandos destructivos (`push --force`, `reset --hard`, etc.) salvo petición explícita.
5. **No commitear** archivos con secretos (`.env`, credenciales, tokens).
6. **No hacer** `git push -u origin main --force` a `main` sin advertir al usuario.

## Flujo estándar

### 1. Verificar estado

Ejecutar en paralelo:

```bash
git status
git remote -v
git branch -vv
```

### 2. Configurar remoto (solo si no existe)

Si `git remote -v` no muestra `origin`:

```bash
git remote add origin https://github.com/jtarapuez/GeolocalizacionSalud.git
```

Si `origin` apunta a otra URL, informar al usuario antes de cambiarla.

### 3. Preparar commit (solo si el usuario lo pidió)

En paralelo:

```bash
git status
git diff
git log -5 --oneline
```

- Agregar archivos relevantes con `git add`.
- Mensaje de commit: 1–2 oraciones, enfoque en el **por qué**.
- Usar HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
Mensaje del commit aquí.

EOF
)"
```

### 4. Push (solo si el usuario lo pidió)

Primera vez en la rama:

```bash
git push -u origin main
```

Siguientes pushes:

```bash
git push origin main
```

### 5. Verificar

```bash
git status
```

## Autenticación GitHub

Si el push falla por credenciales:

1. **HTTPS**: usar Personal Access Token (PAT) de GitHub como contraseña, o `gh auth login`.
2. **SSH** (alternativa): remoto `git@github.com:jtarapuez/GeolocalizacionSalud.git` — solo cambiar si el usuario lo pide y tiene SSH configurado.

Comprobar sesión con:

```bash
gh auth status
```

## Comandos útiles

```bash
# Ver cambios sin commitear
git diff --stat

# Historial reciente
git log --oneline -10

# Abrir repo en navegador
gh repo view jtarapuez/GeolocalizacionSalud --web
```

## Script auxiliar

Para un push guiado, ejecutar desde la raíz del proyecto:

```bash
./.cursor/skills/git-geolocalizacion-salud/scripts/push-check.sh
```

El script solo verifica remoto, rama y estado; **no hace commit ni push** sin confirmación del usuario en el chat.

## Ejemplo de interacción

**Usuario:** "Sube mis cambios a GitHub"

**Agente:**
1. Revisa `git status` y `git diff`.
2. Resume qué se subiría.
3. Si no hay commit, pregunta o crea commit (según lo pedido).
4. Ejecuta `git push -u origin main` (o `git push` si ya tiene upstream).
5. Confirma URL del repo: https://github.com/jtarapuez/GeolocalizacionSalud
