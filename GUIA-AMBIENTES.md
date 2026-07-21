# GUÍA COMPLETA DE AMBIENTES - IESS Salud

## 📋 Descripción

Esta aplicación de Angular está configurada para trabajar con **3 ambientes diferentes**:
- **Desarrollo** (Development)
- **Staging** (Pruebas)
- **Producción** (Production)

## 🏗️ Estructura de Ambientes

### 📁 Archivos de Configuración

```
src/environments/
├── environment.ts              # Desarrollo (por defecto)
├── environment.staging.ts      # Staging/Pruebas
└── environment.production.ts   # Producción
```

### ⚙️ Configuraciones por Ambiente

#### 🔧 **Desarrollo** (`environment.ts`)
```typescript
export const environment = {
  production: false,
  staging: false,
  enableConsoleLogging: true,
  enableAnalytics: false,
  appTitle: 'IESS Salud - Desarrollo',
  apiUrl: 'assets/data',
  unidadesMedicasDataUrl: 'assets/data/unidades-medicas.json'
};
```

#### 🧪 **Staging** (`environment.staging.ts`)
```typescript
export const environment = {
  production: false,
  staging: true,
  enableConsoleLogging: true,
  enableAnalytics: true,
  appTitle: 'IESS Salud - Staging',
  apiUrl: 'assets/data',
  unidadesMedicasDataUrl: 'assets/data/unidades-medicas.json'
};
```

#### 🚀 **Producción** (`environment.production.ts`)
```typescript
export const environment = {
  production: true,
  staging: false,
  enableConsoleLogging: false,
  enableAnalytics: true,
  appTitle: 'IESS Salud',
  apiUrl: 'assets/data',
  unidadesMedicasDataUrl: 'assets/data/unidades-medicas.json'
};
```

## 🚀 Comandos para Ejecutar

### 📱 Desarrollo
```bash
# Opción 1: Comando directo
ng serve --port 4200

# Opción 2: Con configuración explícita
ng serve --configuration development --port 4200

# Opción 3: En segundo plano
ng serve --port 4200 &
```

### 🧪 Staging
```bash
# Comando para staging
ng serve --configuration staging --port 4200

# En segundo plano
ng serve --configuration staging --port 4200 &
```

### 🚀 Producción
```bash
# Comando para producción
ng serve --configuration production --port 4200

# En segundo plano
ng serve --configuration production --port 4200 &
```

## 🤖 Script de Automatización

Se creó un script en `scripts/ambiente.sh` para facilitar el cambio entre ambientes:

### 📝 Uso del Script

```bash
# Desarrollo
./scripts/ambiente.sh desarrollo
./scripts/ambiente.sh dev

# Staging
./scripts/ambiente.sh staging
./scripts/ambiente.sh stage

# Producción
./scripts/ambiente.sh produccion
./scripts/ambiente.sh prod
```

### 🔧 Contenido del Script

```bash
#!/bin/bash

# Función para mostrar ayuda
mostrar_ayuda() {
    echo "🌍 GESTOR DE AMBIENTES - IESS Salud"
    echo ""
    echo "Uso: $0 [ambiente]"
    echo ""
    echo "Ambientes disponibles:"
    echo "  desarrollo, dev      - Ambiente de desarrollo"
    echo "  staging, stage       - Ambiente de staging/pruebas" 
    echo "  produccion, prod     - Ambiente de producción"
    echo ""
    echo "Ejemplos:"
    echo "  $0 desarrollo"
    echo "  $0 staging"
    echo "  $0 produccion"
    echo ""
}

# Función para detener servidores previos
detener_servidor() {
    echo "🛑 Deteniendo servidores previos..."
    pkill -f "ng serve" 2>/dev/null || true
    sleep 2
}

# Función para iniciar servidor
iniciar_servidor() {
    local ambiente=$1
    local comando=$2
    
    echo "🚀 Iniciando servidor en ambiente: $ambiente"
    echo "💡 Comando: $comando"
    echo "🌐 URL: http://localhost:4200"
    echo ""
    echo "⏳ Esperando que el servidor esté listo..."
    
    # Ejecutar el comando en segundo plano
    eval "$comando" &
    
    # Guardar el PID del proceso
    servidor_pid=$!
    
    # Esperar un momento para que el servidor inicie
    sleep 5
    
    echo "✅ Servidor iniciado correctamente!"
    echo "📊 PID del proceso: $servidor_pid"
    echo ""
    echo "Para detener el servidor:"
    echo "   kill $servidor_pid"
    echo "   o presiona Ctrl+C"
}

# Verificar si se proporcionó un argumento
if [ $# -eq 0 ]; then
    mostrar_ayuda
    exit 1
fi

# Procesar el ambiente solicitado
ambiente=$1

# Detener cualquier servidor previo
detener_servidor

case "$ambiente" in
    "desarrollo"|"dev")
        iniciar_servidor "DESARROLLO" "ng serve --port 4200 --poll 2000"
        ;;
    "staging"|"stage")
        iniciar_servidor "STAGING" "ng serve --configuration staging --port 4200 --poll 2000"
        ;;
    "produccion"|"prod")
        iniciar_servidor "PRODUCCIÓN" "ng serve --configuration production --port 4200 --poll 2000"
        ;;
    "help"|"-h"|"--help")
        mostrar_ayuda
        ;;
    *)
        echo "❌ Error: Ambiente '$ambiente' no reconocido"
        echo ""
        mostrar_ayuda
        exit 1
        ;;
esac

# Mantener el script corriendo para mostrar logs
wait
```

## 🔧 Configuración de Angular.json

En el archivo `angular.json` se configuró:

```json
{
  "projects": {
    "PaginaSalud": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "budgets": [...],
              "outputHashing": "all"
            },
            "staging": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.staging.ts"
                }
              ]
            },
            "development": {
              "buildOptimizer": false,
              "optimization": false,
              "vendorChunk": true,
              "extractLicenses": false,
              "sourceMap": true,
              "namedChunks": true,
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.ts"
                }
              ]
            }
          },
          "defaultConfiguration": "development"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "PaginaSalud:build:production"
            },
            "staging": {
              "buildTarget": "PaginaSalud:build:staging"
            },
            "development": {
              "buildTarget": "PaginaSalud:build:development"
            }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
```

## 📊 Verificación de Ambiente Activo

Para verificar qué ambiente está ejecutándose, revisa:

1. **Título de la página** (cambia según el ambiente)
2. **Consola del navegador** (logs habilitados en dev/staging)
3. **Network tab** (URLs de API diferentes por ambiente)

## 🐛 Resolución de Problemas

### Error: "This command is not available when running the Angular CLI outside a workspace"

**Solución:** Asegúrate de estar en el directorio correcto:
```bash
cd PaginaSalud
```

### Puerto 4200 ya en uso

**Solución:** Detener procesos previos:
```bash
pkill -f "ng serve"
# o usar el script
./scripts/ambiente.sh [ambiente]
```

### Script no ejecutable

**Solución:** Dar permisos de ejecución:
```bash
chmod +x scripts/ambiente.sh
```

## 📝 Notas Importantes

- ✅ Todos los ambientes usan datos estáticos desde `assets/data/`
- ✅ En el futuro se pueden configurar URLs de API reales
- ✅ El script automatiza el cambio entre ambientes
- ✅ Cada ambiente tiene configuraciones específicas
- ✅ Logs de consola habilitados solo en desarrollo y staging

## 🚀 Comandos Rápidos

```bash
# Quick start - Desarrollo
./scripts/ambiente.sh dev

# Quick start - Staging  
./scripts/ambiente.sh stage

# Quick start - Producción
./scripts/ambiente.sh prod
```

---

**Autor:** Asistente AI  
**Fecha:** Diciembre 2024  
**Proyecto:** IESS Salud - Página Web
